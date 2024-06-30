require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {loggers} = require("winston");
const logger = require("./logger");
const app = express();
const helmet = require('helmet');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
//Doc
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(helmet());
app.use(cors());
app.use(express.json());

// Configuration de la base de données
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Fonction pour créer la base de données et les tables
const createDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        await connection.query(`USE ${dbConfig.database}`);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users
            (
                id
                INT
                AUTO_INCREMENT
                PRIMARY
                KEY,
                username
                VARCHAR
            (
                255
            ) NOT NULL UNIQUE,
                email VARCHAR
            (
                255
            ) NOT NULL UNIQUE,
                password VARCHAR
            (
                255
            ) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS posts (
                                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                                 user_id INT NOT NULL,
                                                 title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE KEY unique_user_post (user_id, title)
                )
        `);

        await connection.query(`
  CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

        console.log('Base de données et tables créées avec succès');
        await connection.end();
    } catch (error) {
        console.error('Erreur lors de la création de la base de données:', error);
        throw error;
    }
};

// Fonction pour initialiser l'utilisateur "michel" et ses posts
const initializeDefaultUser = async (pool) => {
    try {
        // Vérifier si l'utilisateur existe déjà
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            ['michel']
        );

        let userId;

        if (existingUsers.length > 0) {
            // L'utilisateur existe déjà, utiliser son ID
            userId = existingUsers[0].id;
            console.log('Utilisateur "michel" existe déjà avec l\'ID:', userId);
        } else {
            // Créer le nouvel utilisateur
            const hashedPassword = await bcrypt.hash('password123', 10);
            const [userResult] = await pool.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                ['michel', 'michel@example.com', hashedPassword]
            );
            userId = userResult.insertId;
            console.log('Nouvel utilisateur "michel" créé avec l\'ID:', userId);
        }

        if (!userId) {
            throw new Error('Impossible d\'obtenir un ID valide pour l\'utilisateur');
        }

        const defaultPosts = [
            {
                title: 'Mon expérience universitaire',
                content: 'Voici quelques anecdotes sur ma vie d\'étudiant...'
            }
        ];

        for (const post of defaultPosts) {
            await pool.query(
                'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)',
                [userId, post.title, post.content]
            );
        }

        console.log('Utilisateur "michel" et ses posts créés ou mis à jour avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'utilisateur par défaut:', error);
        throw error;
    }
};

// Fonction principale pour démarrer le serveur
const startServer = async () => {
    try {
        await createDatabase();

        const pool = mysql.createPool(dbConfig);

        await initializeDefaultUser(pool);

        // Middleware pour vérifier le token JWT
        const authenticateToken = (req, res, next) => {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (token == null) return res.sendStatus(401);

            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) return res.sendStatus(403);
                req.user = user;
                next();
            });
        };

        // Route d'inscription
        app.post('/api/auth/register', async (req, res) => {
            try {
                const {username, email, password} = req.body;

                // Vérification des champs requis
                if (!username || !email || !password) {
                    return res.status(400).json({error: 'Tous les champs sont requis'});
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const [result] = await pool.query(
                    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                    [username, email, hashedPassword]
                );

                const token = jwt.sign({id: result.insertId, username}, process.env.JWT_SECRET);

                res.status(201).json({
                    message: "Inscription réussie",
                    userId: result.insertId,
                    token,
                    username
                });
            } catch (error) {
                console.error('Erreur détaillée:', error);
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({error: 'Cet email est déjà utilisé'});
                }
                res.status(500).json({error: 'Erreur lors de l\'inscription: ' + error.message});
            }
        });

        // Route de connexion
        app.post('/api/auth/login', async (req, res) => {
            try {
                const {email, password} = req.body;
                const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
                if (rows.length === 0) {
                    return res.status(400).json({error: 'Utilisateur non trouvé'});
                }
                const user = rows[0];
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    return res.status(400).json({error: 'Mot de passe incorrect'});
                }
                const token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET);
                res.json({token, userId: user.id, username: user.username});
                logger.info(`User logged in: ${user.email}`);
            } catch (error) {
                console.error(error);
                res.status(500).json({error: 'Erreur lors de la connexion'});
                logger.info(`Login error: ${error.message}`);
            }
        });

        // Route protégée pour récupérer le profil de l'utilisateur
        app.get('/api/profile', authenticateToken, async (req, res) => {
            try {
                const [rows] = await pool.query('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);
                if (rows.length === 0) {
                    return res.status(404).json({error: 'Utilisateur non trouvé'});
                }
                res.json(rows[0]);
            } catch (error) {
                console.error(error);
                res.status(500).json({error: 'Erreur lors de la récupération du profil'});
            }
        });

        // Route pour récupérer tous les posts
        app.get('/api/posts', async (req, res) => {
            try {
                const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
                res.json(rows);
            } catch (error) {
                console.error(error);
                res.status(500).json({error: 'Erreur lors de la récupération des posts'});
            }
        });

        // Route pour récupérer un post spécifique
        app.get('/api/posts/:id', async (req, res) => {
            try {
                const [rows] = await pool.query(
                    `SELECT posts.*, users.username
                     FROM posts
                              JOIN users ON posts.user_id = users.id
                     WHERE posts.id = ?`,
                    [req.params.id]
                );

                if (rows.length === 0) {
                    return res.status(404).json({error: 'Post non trouvé'});
                }

                // Formatez la date en chaîne ISO avant de l'envoyer
                const post = rows[0];
                post.created_at = new Date(post.created_at).toISOString();

                res.json(post);
            } catch (error) {
                console.error(error);
                res.status(500).json({error: 'Erreur lors de la récupération du post'});
            }
        });

        // Récupérer les commentaires d'un post
        app.get('/api/posts/:postId/comments', async (req, res) => {
            try {
                const [rows] = await pool.query(
                    `SELECT comments.*, users.username
                     FROM comments
                              JOIN users ON comments.user_id = users.id
                     WHERE post_id = ?
                     ORDER BY created_at DESC`,
                    [req.params.postId]
                );
                res.json(rows);
            } catch (error) {
                console.error(error);
                res.status(500).json({error: 'Erreur lors de la récupération des commentaires'});
            }
        });

        // Ajouter un commentaire
        app.post('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
            try {
                const {content} = req.body;
                const [result] = await pool.query(
                    'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
                    [req.params.postId, req.user.id, content]
                );
                res.status(201).json({
                    id: result.insertId,
                    post_id: req.params.postId,
                    user_id: req.user.id,
                    content,
                    username: req.user.username,
                    created_at: new Date()
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({error: 'Erreur lors de l\'ajout du commentaire'});
            }
        });

        // Route pour créer un nouveau post
        app.post('/api/posts', authenticateToken, async (req, res) => {
            try {
                const {title, content} = req.body;
                const [result] = await pool.query(
                    'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
                    [req.user.id, title, content]
                );
                res.status(201).json({
                    id: result.insertId,
                    user_id: req.user.id,
                    title,
                    content,
                    created_at: new Date()
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({error: 'Erreur lors de la création du post'});
            }
        });

        // Route pour obtenir les posts d'un utilisateur spécifique
        app.get('/api/users/:userId/posts', authenticateToken, async (req, res) => {
            try {
                const [rows] = await pool.query('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
                res.json(rows);
            } catch (error) {
                console.error(error);
                res.status(500).json({error: 'Erreur lors de la récupération des posts de l\'utilisateur'});
            }
        });

        // Route pour mettre à jour le profil de l'utilisateur
        app.put('/api/profile', authenticateToken, async (req, res) => {
            try {
                const {username, email} = req.body;
                await pool.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, req.user.id]);
                res.json({message: 'Profil mis à jour avec succès'});
            } catch (error) {
                console.error(error);
                res.status(500).json({error: 'Erreur lors de la mise à jour du profil'});
            }
        });

        // Récupérer les commentaires d'un post
        app.get('/api/posts/:postId/comments', async (req, res) => {
            try {
                const [rows] = await pool.query(
                    `SELECT comments.*, users.username 
       FROM comments 
       JOIN users ON comments.user_id = users.id 
       WHERE post_id = ? 
       ORDER BY created_at DESC`,
                    [req.params.postId]
                );
                res.json(rows);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
            }
        });

        // Ajouter un commentaire
        app.post('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
            try {
                const { content } = req.body;
                const [result] = await pool.query(
                    'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
                    [req.params.postId, req.user.id, content]
                );
                const [newComment] = await pool.query(
                    'SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ?',
                    [result.insertId]
                );
                res.status(201).json(newComment[0]);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire' });
            }
        });

        if (require.main === module) {
            const PORT = process.env.PORT || 5000;
            app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
            console.log(`Doc API http://localhost:5000/api-docs/`)
        }
    } catch (error) {
        console.error('Erreur lors du démarrage du serveur:', error);
    }
};

startServer();

module.exports = app;

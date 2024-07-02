const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root_password',
    database: process.env.DB_NAME || 'student_community',
};

let pool = null;

const getPool = () => {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool;
};

const createDatabase = async () => {
    let retries = 10;  // Augmenté à 10 tentatives
    while (retries) {
        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
            });

            await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
            await connection.query(`USE ${process.env.DB_NAME}`);

            await connection.query(`
                CREATE TABLE IF NOT EXISTS users (
                                                     id INT AUTO_INCREMENT PRIMARY KEY,
                                                     username VARCHAR(255) NOT NULL UNIQUE,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
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
            return;
        } catch (error) {
            console.error('Erreur lors de la création de la base de données:', error);
            retries -= 1;
            console.log(`Tentatives restantes: ${retries}`);
            await new Promise(res => setTimeout(res, 10000));  // Augmenté à 10 secondes
        }
    }
    throw new Error("Impossible de se connecter à la base de données après plusieurs tentatives");
};

const initializeDefaultUser = async () => {
    try {
        const pool = getPool();
        let userId;

        const [existingUsers] = await pool.query('SELECT id FROM users WHERE username = ?', ['michel']);

        if (existingUsers.length === 0) {
            const hashedPassword = await bcrypt.hash('test', 10);
            const [result] = await pool.query(
              'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
              ['michel', 'michel@test.com', hashedPassword]
            );
            userId = result.insertId;
            console.log('Utilisateur "michel" créé avec succès');
        } else {
            userId = existingUsers[0].id;
            console.log('Utilisateur "michel" existe déjà');
        }

        const [existingPosts] = await pool.query('SELECT id FROM posts WHERE user_id = ?', [userId]);

        if (existingPosts.length === 0) {
            await pool.query(
              'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
              [userId, 'Mon premier post', 'Bonjour, ceci est mon premier post sur la plateforme !']
            );
            console.log('Post créé pour Michel');
        } else {
            console.log('Michel a déjà au moins un post');
        }

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'utilisateur par défaut:', error);
        throw error;
    }
};

module.exports = {
    createDatabase,
    initializeDefaultUser,
    getPool
};

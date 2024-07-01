const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const logger = require('../config/logger');

exports.register = async (req, res) => {
    try {
        const {username, email, password} = req.body;

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
};

exports.login = async (req, res) => {
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
};

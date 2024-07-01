const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

const createDatabase = async () => {
    let retries = 5;
    while (retries) {
        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
            });

            await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
            await connection.query(`USE ${process.env.DB_NAME}`);

            // Création des tables
            await connection.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Ajoutez ici d'autres créations de tables si nécessaire

            console.log('Base de données et tables créées avec succès');
            await connection.end();
            return;
        } catch (error) {
            console.error('Erreur lors de la création de la base de données:', error);
            retries -= 1;
            console.log(`Tentatives restantes: ${retries}`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    throw new Error("Impossible de se connecter à la base de données après plusieurs tentatives");
};

const initializeDefaultUser = async () => {
    const pool = mysql.createPool(dbConfig);
    try {
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE username = ?', ['michel']);

        if (existingUsers.length === 0) {
            const hashedPassword = await bcrypt.hash('test', 10);
            await pool.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                ['michel', 'michel@test.com', hashedPassword]
            );
            console.log('Utilisateur "michel" créé avec succès');
        } else {
            console.log('Utilisateur "michel" existe déjà');
        }

        // Ajoutez ici la logique pour créer des posts par défaut si nécessaire

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'utilisateur par défaut:', error);
        throw error;
    } finally {
        await pool.end();
    }
};

module.exports = {
    createDatabase,
    initializeDefaultUser,
    dbConfig
};

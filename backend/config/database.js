const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const faker = require('faker');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'student_community',
};

let pool = null;

const getPool = () => {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool;
};

const createTables = async () => {
    const pool = getPool();

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
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

    await pool.query(`
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
};

// const createFakeData = async () => {
//     const pool = getPool();
//
//     // Check if user 'michel' already exists
//     const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ?', ['michel']);
//     if (existingUsers.length === 0) {
//         const michelPassword = await bcrypt.hash('test', 10);
//         await pool.query(
//             'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
//             ['michel', 'michel@test.com', michelPassword]
//         );
//         console.log('Utilisateur Michel ajouté avec succès');
//     } else {
//         console.log('Utilisateur Michel existe déjà');
//     }
//
//     for (let i = 0; i < 9; i++) {
//         const username = faker.internet.userName();
//         const email = faker.internet.email();
//         const password = await bcrypt.hash('password', 10);
//
//         await pool.query(
//             'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
//             [username, email, password]
//         );
//     }
//
//     const [users] = await pool.query('SELECT * FROM users');
//
//     for (const user of users) {
//         const numPosts = Math.floor(Math.random() * 5) + 1;
//
//         for (let i = 0; i < numPosts; i++) {
//             const title = faker.lorem.sentence();
//             const content = faker.lorem.paragraphs(3);
//
//             await pool.query(
//                 'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
//                 [user.id, title, content]
//             );
//         }
//     }
//
//     const [posts] = await pool.query('SELECT * FROM posts');
//
//     for (const post of posts) {
//         const numComments = Math.floor(Math.random() * 11);
//
//         for (let i = 0; i < numComments; i++) {
//             const userId = users[Math.floor(Math.random() * users.length)].id;
//             const content = faker.lorem.sentence();
//
//             await pool.query(
//                 'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
//                 [post.id, userId, content]
//             );
//         }
//     }
// };


const initializeDatabase = async () => {
    try {
        await createTables();
        console.log('Tables créées avec succès');

        await createFakeData();
        console.log('Données fictives créées avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        throw error;
    }
};

module.exports = {
    initializeDatabase,
    getPool
};

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root_password',
    database: process.env.DB_NAME || 'student_community',
};

let pool = null;

const getPool = () => {
    if (!pool) {
        console.log('Creating new connection pool');
        pool = mysql.createPool(dbConfig);
    }
    return pool;
};

const checkDatabaseExists = async () => {
    const tempPool = mysql.createPool({
        ...dbConfig,
        database: null
    });
    try {
        const [rows] = await tempPool.query(`SHOW DATABASES LIKE '${dbConfig.database}'`);
        return rows.length > 0;
    } finally {
        await tempPool.end();
    }
};

const createDatabase = async () => {
    const tempPool = mysql.createPool({
        ...dbConfig,
        database: null
    });
    try {
        await tempPool.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log(`Database ${dbConfig.database} created or already exists`);
    } finally {
        await tempPool.end();
    }
};

const checkTableExists = async (tableName) => {
    const pool = getPool();
    const [rows] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = ?
    `, [dbConfig.database, tableName]);
    return rows[0].count > 0;
};

const createTables = async () => {
    const pool = getPool();
    console.log('Checking and creating tables if necessary...');

    const tables = {
        users: `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `,
        posts: `
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE KEY unique_user_post (user_id, title)
            )
        `,
        comments: `
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `
    };

    for (const [tableName, query] of Object.entries(tables)) {
        const exists = await checkTableExists(tableName);
        if (!exists) {
            await pool.query(query);
            console.log(`Table ${tableName} created`);
        } else {
            console.log(`Table ${tableName} already exists`);
        }
    }
};

const createFakeData = async () => {
    const pool = getPool();
    console.log('Creating fake data...');

    // Check if users table is empty
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userCount[0].count > 0) {
        console.log('Fake data already exists, skipping creation');
        return;
    }

    // Create fake users
    const users = [];
    for (let i = 0; i < 10; i++) {
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = await bcrypt.hash('password123', 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        users.push({ id: result.insertId, username });
    }

    // Create fake posts
    for (const user of users) {
        for (let i = 0; i < 3; i++) {
            const title = faker.lorem.sentence();
            const content = faker.lorem.paragraphs();
            const [result] = await pool.query(
                'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
                [user.id, title, content]
            );

            // Create fake comments for each post
            for (let j = 0; j < 5; j++) {
                const commentUser = users[Math.floor(Math.random() * users.length)];
                const commentContent = faker.lorem.sentence();
                await pool.query(
                    'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
                    [result.insertId, commentUser.id, commentContent]
                );
            }
        }
    }

    console.log('Fake data created successfully');
};

const initializeDatabase = async () => {
    try {
        console.log('Initializing database...');

        const dbExists = await checkDatabaseExists();
        if (!dbExists) {
            await createDatabase();
            await createTables();
            await createFakeData();
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        throw error;
    }
};

module.exports = {
    initializeDatabase,
    getPool,
    initializeDefaultUser: createFakeData
};

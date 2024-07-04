// global-setup.js
const { chromium } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const { getPool } = require('../../backend/config/database');

async function globalSetup() {
    console.log('Starting global setup');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        console.log('Navigating to register page');
        await page.goto('http://localhost:3000/register');

        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password();

        console.log('Filling registration form');
        await page.fill('input[placeholder="Nom d\'utilisateur"]', username);
        await page.fill('input[placeholder="Email"]', email);
        await page.fill('input[placeholder="Mot de passe"]', password);

        console.log('Submitting registration form');
        const [response] = await Promise.all([
            page.waitForResponse(response => response.url().includes('/api/auth/register') && response.request().method() === 'POST'),
            page.click('button[type="submit"]')
        ]);

        console.log('Registration response received');
        const responseBody = await response.json();
        console.log('Registration response:', responseBody);

        if (!response.ok()) {
            throw new Error(`Registration failed: ${responseBody.error}`);
        }

        const pool = getPool();
        await pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );

        console.log('Test user created successfully');
    } catch (error) {
        console.error('Error in global setup:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

module.exports = globalSetup;

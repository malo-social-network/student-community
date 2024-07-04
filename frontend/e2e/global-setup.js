const { chromium } = require('@playwright/test');
const { faker } = require('@faker-js/faker');

async function globalSetup() {
    console.log('Starting global setup');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        console.log('Navigating to register page');
        await page.goto('http://localhost:3000/register');

        console.log('Filling registration form');
        await page.fill('input[placeholder="Nom d\'utilisateur"]', faker.internet.userName());
        await page.fill('input[placeholder="Email"]', faker.internet.email());
        await page.fill('input[placeholder="Mot de passe"]', faker.internet.password());

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

        console.log('Test user created successfully');
    } catch (error) {
        console.error('Error in global setup:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

module.exports = globalSetup;

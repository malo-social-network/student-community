const { chromium } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

async function globalSetup() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const testUser = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password()
    };

    try {
        await page.goto('http://localhost:3000/register');
        await page.fill('input[placeholder="Nom d\'utilisateur"]', testUser.username);
        await page.fill('input[placeholder="Email"]', testUser.email);
        await page.fill('input[placeholder="Mot de passe"]', testUser.password);

        const [response] = await Promise.all([
            page.waitForResponse(response => response.url().includes('/api/auth/register') && response.request().method() === 'POST'),
            page.click('button[type="submit"]')
        ]);

        const responseBody = await response.json();
        console.log('Réponse d\'enregistrement:', responseBody);

        if (!response.ok()) {
            throw new Error(`Échec de l'enregistrement: ${responseBody.error}`);
        }

        console.log('Utilisateur de test créé avec succès');

        // Sauvegarder les informations de l'utilisateur dans un fichier
        fs.writeFileSync(path.join(__dirname, 'testUser.json'), JSON.stringify(testUser));
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur de test:', error);
    } finally {
        await browser.close();
    }
}

module.exports = globalSetup;

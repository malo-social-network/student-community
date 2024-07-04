const { test, expect } = require('@playwright/test');
const { getTestUser } = require('./testUser');

test.describe('Authentication', () => {
    test('should successfully log in and receive a token', async ({ page }) => {
        const testUser = {
            username: process.env.TEST_USER_USERNAME,
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD
        };
        await page.goto('/login');
        await page.fill('input[placeholder="Email"]', testUser.email);
        await page.fill('input[placeholder="Mot de passe"]', testUser.password);

        const [loginResponse] = await Promise.all([
            page.waitForResponse(response => response.url().includes('/api/auth/login') && response.request().method() === 'POST'),
            page.click('button[type="submit"]')
        ]);

        const loginBody = await loginResponse.json();
        console.log('Réponse de login:', loginBody);

        expect(loginResponse.ok()).toBeTruthy();

        const token = await page.evaluate(() => localStorage.getItem('token'));
        console.log('Token après connexion:', token);
        expect(token).not.toBeNull();
    });

    test('should redirect to home page and show logout button after login', async ({ page }) => {
        const testUser = getTestUser();
        await page.goto('/login');
        await page.fill('input[placeholder="Email"]', testUser.email);
        await page.fill('input[placeholder="Mot de passe"]', testUser.password);
        await page.click('button[type="submit"]');

        await page.waitForURL('/');
        await expect(page.locator('button:has-text("Déconnexion")')).toBeVisible();
    });
});

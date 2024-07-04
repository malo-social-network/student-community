const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');

const testUser = {
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
    username: process.env.TEST_USER_USERNAME
};

test.describe('User Profile', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[placeholder="Email"]', testUser.email);
        await page.fill('input[placeholder="Mot de passe"]', testUser.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/');
    });

    test('should display user profile information', async ({ page }) => {
        await page.goto('/profile');

        await expect(page.locator('text=' + testUser.username)).toBeVisible();
        await expect(page.locator('text=' + testUser.email)).toBeVisible();
    });

    test('should allow user to edit profile', async ({ page }) => {
        const newUsername = faker.internet.userName();

        await page.goto('/profile');
        await page.click('button:has-text("Modifier le profil")');

        await page.fill('input[name="username"]', newUsername);
        await page.click('button[type="submit"]');

        await expect(page.locator('text=' + newUsername)).toBeVisible();

        // Vérifier que le changement a bien été enregistré
        await page.reload();
        await expect(page.locator('text=' + newUsername)).toBeVisible();
    });
});

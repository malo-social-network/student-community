const { test, expect } = require('@playwright/test');
const { getTestUser } = require('./testUser');
const { faker } = require('@faker-js/faker');

test.describe('User Profile', () => {
    test.beforeEach(async ({ page }) => {
        const testUser = getTestUser();
        await page.goto('/login');
        await page.fill('input[placeholder="Email"]', testUser.email);
        await page.fill('input[placeholder="Mot de passe"]', testUser.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/');
    });

    test('should display user profile information', async ({ page }) => {
        const testUser = getTestUser();
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

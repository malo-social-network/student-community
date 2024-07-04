const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const { testUser, getTestUser} = require('./testUser');

test.describe('Posts', () => {
    test.beforeEach(async ({ page }) => {
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
        console.log('Token stocké:', token);
        expect(token).not.toBeNull();

        await page.waitForURL('/');
    });

    test('should allow user to create a post', async ({ page }) => {
        const postTitle = faker.lorem.sentence(faker.number.int({ min: 3, max: 10 })).slice(0, -1);
        const postContent = faker.lorem.paragraphs(faker.number.int({ min: 2, max: 5 }));

        console.log(`Création d'un nouveau post avec le titre: "${postTitle}"`);

        await page.goto('/create-post');
        await expect(page.locator('h2')).toHaveText('Créer un nouveau post');

        await page.fill('input[id="title"]', postTitle);
        await page.fill('textarea[id="content"]', postContent);

        const [response] = await Promise.all([
            page.waitForResponse(response => response.url().includes('/api/posts') && response.request().method() === 'POST'),
            page.click('button[type="submit"]')
        ]);

        console.log(`Statut de la réponse de création de post: ${response.status()}`);

        const responseBody = await response.text();
        console.log('Corps de la réponse:', responseBody);

        if (!response.ok()) {
            console.error('Erreur lors de la création du post. Statut:', response.status());
            console.error('Corps de la réponse:', responseBody);

            const logs = await page.evaluate(() => {
                return console.logs;
            });
            console.log('Logs du navigateur:', logs);
        }

        expect(response.ok()).toBeTruthy();

        await page.waitForTimeout(5000);

        const currentUrl = page.url();
        console.log(`URL actuelle après la création du post: ${currentUrl}`);

        await page.goto('/');
        await page.waitForTimeout(2000);

        const findPost = async () => {
            const posts = await page.locator('.post-preview').all();
            console.log(`Nombre de posts trouvés sur la page: ${posts.length}`);
            for (const post of posts) {
                const titleElement = await post.locator('h2').first();
                const postTitleText = await titleElement.innerText();
                if (postTitleText.includes(postTitle)) {
                    console.log(`Post correspondant trouvé: "${postTitleText}"`);
                    return true;
                }
            }
            return false;
        };

        let found = false;
        for (let i = 0; i < 5; i++) {
            console.log(`Tentative de recherche du post ${i + 1}`);
            found = await findPost();
            if (found) break;
            await page.waitForTimeout(3000);
            await page.reload();
        }

        if (!found) {
            console.log('Post non trouvé. Tous les titres de posts sur la page:');
            const allTitles = await page.locator('.post-preview h2').allInnerTexts();
            console.log(allTitles);

            const pageContent = await page.content();
            console.log('Contenu de la page:', pageContent);

            const logs = await page.evaluate(() => {
                return console.logs;
            });
            console.log('Logs du navigateur:', logs);
        }

        expect(found).toBeTruthy();
    });

    test('should display posts on the home page', async ({ page }) => {
        await page.goto('/');

        await page.waitForSelector('.post-preview');

        const scrollToBottom = async () => {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(1000);
        };

        for (let i = 0; i < 3; i++) {
            await scrollToBottom();
        }

        const postCount = await page.locator('.post-preview').count();

        console.log(`Nombre de posts trouvés : ${postCount}`);

        expect(postCount).toBeGreaterThan(0);

        if (postCount > 0) {
            const firstPost = page.locator('.post-preview').first();
            await expect(firstPost.locator('h2')).toBeVisible();
            await expect(firstPost.locator('p')).toBeVisible();
            await expect(firstPost.locator('a')).toHaveText('Lire la suite');
        }
    });
});

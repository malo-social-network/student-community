const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');

test.setTimeout(60000);

const BASE_URL = 'http://localhost:3000';

const testUser = {
    username: 'michel',
    email: 'michel@test.com',
    password: 'test'
};

async function logPageState(page, message) {
    console.log(`\n--- ${message} ---`);
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    console.log('Available links:', await page.$$eval('a', links => links.map(a => ({ text: a.textContent, href: a.href }))));
    console.log('Available buttons:', await page.$$eval('button', buttons => buttons.map(b => b.textContent)));
    console.log('HTML content:', await page.content());
    console.log('-------------------\n');
}

async function login(page) {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[placeholder="Email"]', testUser.email);
    await page.fill('input[placeholder="Mot de passe"]', testUser.password);
    await page.click('button:has-text("Se connecter")');
    await page.waitForTimeout(2000);
}

test('log in and verify user state', async ({ page }) => {
    await login(page);
    await logPageState(page, 'After login attempt');

    const profileLink = await page.$('text=Profil');
    expect(profileLink, 'Lien de profil non trouvé').toBeTruthy();

    const createPostLink = await page.$('text=Créer un post');
    expect(createPostLink, 'Lien de création de post non trouvé').toBeTruthy();

    const logoutLink = await page.$('text=Déconnexion');
    expect(logoutLink, 'Lien de déconnexion non trouvé').toBeTruthy();
});

test('create a new post', async ({ page }) => {
    await login(page);
    await logPageState(page, 'After login (create post)');

    await page.click('text=Créer un post');

    await page.waitForTimeout(2000);
    await logPageState(page, 'Create post form');

    const randomTitle = `Mon nouveau post de test ${faker.lorem.word()}`;
    const randomContent = `Ceci est le contenu de mon post de test ${faker.lorem.paragraph()}`;

    await page.fill('input[id="title"]', randomTitle);
    await page.fill('textarea[id="content"]', randomContent);
    await page.click('button:has-text("Publier")');

    await page.waitForTimeout(2000);
    await logPageState(page, 'After creating post');

    const newPost = await page.$(`text=${randomTitle}`);
    expect(newPost, 'Le nouveau post n\'a pas été trouvé').toBeTruthy();
});

test('add a comment to a post', async ({ page }) => {
    await login(page);
    await logPageState(page, 'After login (comment test)');

    const firstPost = await page.$('text=Lire la suite');
    expect(firstPost, 'Aucun post trouvé').toBeTruthy();
    await firstPost.click();

    await page.waitForTimeout(2000);
    await logPageState(page, 'Post detail page');

    const commentContent = `Ceci est un commentaire de test ${faker.lorem.sentence()}`;
    await page.fill('textarea[placeholder="Ajouter un commentaire..."]', commentContent);
    await page.click('button:has-text("Publier")');

    await page.waitForTimeout(2000);
    await logPageState(page, 'After adding comment');

    const newComment = await page.$(`text=${commentContent}`);
    expect(newComment, 'Le nouveau commentaire n\'a pas été trouvé').toBeTruthy();
});

test('update user profile and revert changes', async ({ page }) => {
    await login(page);
    await logPageState(page, 'After login (profile update)');

    const profileLink = await page.$('text=Profil');
    expect(profileLink, 'Lien de profil non trouvé').toBeTruthy();
    await profileLink.click();

    await page.waitForTimeout(2000);
    await logPageState(page, 'Profile page');

    await page.click('text=Modifier le profil');

    const newUsername = `michel_updated_${faker.random.alphaNumeric(5)}`;
    const newEmail = `michel_updated_${faker.random.alphaNumeric(5)}@test.com`;

    await page.fill('input[id="username"]', newUsername);
    await page.fill('input[id="email"]', newEmail);
    await page.click('button:has-text("Sauvegarder")');

    await page.waitForTimeout(2000);
    await logPageState(page, 'After profile update');

    const updatedUsername = await page.$(`text=${newUsername}`);
    expect(updatedUsername, 'Le nouveau nom d\'utilisateur n\'a pas été trouvé').toBeTruthy();

    await page.click('text=Modifier le profil');
    await page.fill('input[id="username"]', testUser.username);
    await page.fill('input[id="email"]', testUser.email);
    await page.click('button:has-text("Sauvegarder")');

    await page.waitForTimeout(2000);
    await logPageState(page, 'After reverting profile');

    const revertedUsername = await page.$(`text=${testUser.username}`);
    expect(revertedUsername, 'Le nom d\'utilisateur n\'a pas été remis à sa valeur initiale').toBeTruthy();
});

test('log out user', async ({ page }) => {
    await login(page);
    await logPageState(page, 'After login (logout test)');

    const logoutButton = await page.$('text=Déconnexion');
    expect(logoutButton, 'Bouton de déconnexion non trouvé').toBeTruthy();
    await logoutButton.click();

    await page.waitForTimeout(2000);
    await logPageState(page, 'After logout');

    const loginLink = await page.$('text=Connexion');
    expect(loginLink, 'Lien de connexion non trouvé après déconnexion').toBeTruthy();

    const registerLink = await page.$('text=Inscription');
    expect(registerLink, 'Lien d\'inscription non trouvé après déconnexion').toBeTruthy();

    const profileLink = await page.$('text=Profil');
    expect(profileLink, 'Lien de profil toujours visible après déconnexion').toBeFalsy();

    const createPostLink = await page.$('text=Créer un post');
    expect(createPostLink, 'Lien de création de post toujours visible après déconnexion').toBeFalsy();
});

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost' | 'http://localhost:80';

async function logPageState(page, message) {
    console.log(`\n--- ${message} ---`);
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    console.log('Available links:', await page.$$eval('a', links => links.map(a => ({ text: a.textContent, href: a.href }))));
    console.log('Available buttons:', await page.$$eval('button', buttons => buttons.map(b => b.textContent)));
    console.log('HTML content:', await page.content());
    console.log('-------------------\n');
}
test('log in and verify user state', async ({ page }) => {
    await page.goto(BASE_URL);
    await logPageState(page, 'Initial state');

    await page.click('text=Connexion');
    await logPageState(page, 'Login page');

    await page.fill('input[placeholder="Email"]', 'michel@test.com');
    await page.fill('input[placeholder="Mot de passe"]', 'test');
    await page.click('button:has-text("Se connecter")');

    await page.waitForTimeout(5000);
    await logPageState(page, 'After login attempt');

    const loggedInIndicators = ['Profil', 'Déconnexion', 'Créer un post'];
    for (const indicator of loggedInIndicators) {
        const element = await page.$(`text=${indicator}`);
        console.log(`Indicator "${indicator}" ${element ? 'found' : 'not found'}`);
    }

    const isLoggedIn = await page.evaluate(() => {
        return !!localStorage.getItem('token') || document.cookie.includes('token');
    });
    console.log('Login state based on token:', isLoggedIn);

    const anyLoggedInElement = await page.$('text=Profil');
    expect(anyLoggedInElement, 'Aucun élément indiquant que l\'utilisateur est connecté n\'a été trouvé').toBeTruthy();
});

test('navigate through the application', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('text=Connexion');
    await page.fill('input[placeholder="Email"]', 'michel@test.com');
    await page.fill('input[placeholder="Mot de passe"]', 'test');
    await page.click('button:has-text("Se connecter")');

    await page.waitForTimeout(5000);
    await logPageState(page, 'After login');

    const createPostButton = await page.$('text=Créer un post, text=Nouveau post, button:has-text("Post")');
    if (createPostButton) {
        await createPostButton.click();
        await page.waitForTimeout(2000);
        await logPageState(page, 'Create post page');
    } else {
        console.log('Create post button not found');
    }

    const profileLink = await page.$('text=Profil, a:has-text("Profil")');
    if (profileLink) {
        await profileLink.click();
        await page.waitForTimeout(2000);
        await logPageState(page, 'Profile page');
    } else {
        console.log('Profile link not found');
    }

    await logPageState(page, 'Final state');
});

test('create a new post', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('text=Connexion');
    await page.fill('input[placeholder="Email"]', 'michel@test.com');
    await page.fill('input[placeholder="Mot de passe"]', 'test');
    await page.click('button:has-text("Se connecter")');

    await page.waitForTimeout(5000);
    await logPageState(page, 'After login (create post)');

    await page.click('text=Créer un post');

    await page.waitForTimeout(2000);
    await logPageState(page, 'Create post form');

    const randomTitle = `Mon nouveau post de test ${Math.random().toString(36).substring(7)}`;
    const randomContent = `Ceci est le contenu de mon post de test ${Math.random().toString(36).substring(7)}`;

    await page.fill('input[id="title"]', randomTitle);
    await page.fill('textarea[id="content"]', randomContent);
    await page.click('button:has-text("Publier")');

    await page.waitForTimeout(2000);
    await logPageState(page, 'After creating post');

    const newPost = await page.$(`text=${randomTitle}`);
    expect(newPost, 'Le nouveau post n\'a pas été trouvé').toBeTruthy();
});

test('add a comment to a post', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('text=Connexion');
    await page.fill('input[placeholder="Email"]', 'michel@test.com');
    await page.fill('input[placeholder="Mot de passe"]', 'test');
    await page.click('button:has-text("Se connecter")');

    await page.waitForTimeout(5000);
    await logPageState(page, 'After login (comment test)');

    const firstPost = await page.$('text=Lire la suite');
    expect(firstPost, 'Aucun post trouvé').toBeTruthy();
    await firstPost.click();

    await page.waitForTimeout(2000);
    await logPageState(page, 'Post detail page');

    await page.fill('textarea[placeholder="Ajouter un commentaire..."]', 'Ceci est un commentaire de test.');
    await page.click('button:has-text("Publier")');

    await page.waitForTimeout(2000);
    await logPageState(page, 'After adding comment');

    const newComment = await page.$('text=Ceci est un commentaire de test.');
    expect(newComment, 'Le nouveau commentaire n\'a pas été trouvé').toBeTruthy();
});

test('update user profile', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('text=Connexion');
    await page.fill('input[placeholder="Email"]', 'michel@test.com');
    await page.fill('input[placeholder="Mot de passe"]', 'test');
    await page.click('button:has-text("Se connecter")');

    await page.waitForTimeout(5000);
    await logPageState(page, 'After login (profile update)');

    const profileLink = await page.$('text=Profil');
    expect(profileLink, 'Lien de profil non trouvé').toBeTruthy();
    await profileLink.click();

    await page.waitForTimeout(2000);
    await logPageState(page, 'Profile page');

    await page.click('text=Modifier le profil');

    const randomUsername = `michel_updated_${Math.random().toString(36).substring(7)}`;
    const randomEmail = `michel_updated_${Math.random().toString(36).substring(7)}@test.com`;

    await page.fill('input[id="username"]', randomUsername);
    await page.fill('input[id="email"]', randomEmail);
    await page.click('button:has-text("Sauvegarder")');

    await page.waitForTimeout(2000);

    await logPageState(page, 'After profile update');

    const newUsername = await page.$(`text=${randomUsername}`);
    expect(newUsername, 'Le nouveau usernmae n\'a pas été trouvé').toBeTruthy();
});

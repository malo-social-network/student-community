describe('App E2E', () => {
    it('should load the home page', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Fil d\'actualité').should('be.visible');
    });

    it('should navigate to login page', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Connexion').click();
        cy.url().should('include', '/login');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
    });
});

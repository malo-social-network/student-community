describe('Login Flow', () => {
    it('should login successfully', () => {
        cy.visit('/login');
        cy.get('input[name=email]').type('test@example.com');
        cy.get('input[name=password]').type('password123');
        cy.get('button[type=submit]').click();
        cy.url().should('include', '/dashboard');
        cy.contains('Welcome, User').should('be.visible');
    });
});

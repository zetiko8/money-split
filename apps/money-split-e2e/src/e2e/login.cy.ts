import { ACTIONS } from "../support/actions";

describe('Login', () => {
    beforeEach(() => {
        ACTIONS.deleteOwner('testuser');
        cy.visit('/login'); // replace with the actual path to your login page
        ACTIONS.registerOwner('testuser', 'testpassword');
    });
  
    it('should login with valid credentials', () => {
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('testpassword');
      cy.get('button[type="submit"]').click();
  
      cy.url().should('include', '/realm'); // replace with the actual path to your dashboard page
    });
  
    it('should not login with invalid password', () => {
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('invalidpassword');
      cy.get('button[type="submit"]').click();
  
      cy
      .get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain', 'UNAUTHORIZED')  
    });

    it('should not login with invalid username', () => {
      cy.get('input[name="username"]').type('invaliduser');
      cy.get('input[name="password"]').type('invalidpassword');
      cy.get('button[type="submit"]').click();
  
      cy
      .get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain', 'RESOURCE_NOT_FOUND')  
    });
  });
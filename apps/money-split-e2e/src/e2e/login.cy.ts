import { ACTIONS } from '../support/actions';
import { LOGIN_FORM } from '../support/app.po';

describe('Login', () => {
  beforeEach(() => {
    ACTIONS.deleteOwner('testuser');
    cy.visit('/login'); // replace with the actual path to your login page
    ACTIONS.registerOwner('testuser', 'testpassword');
  });

  it('should login with valid credentials', () => {
    LOGIN_FORM.login('testuser', 'testpassword');
    cy.url().should('include', '/realm');
  });

  it('should not login with invalid password', () => {
    LOGIN_FORM.login('testuser', 'invalidpassword');
    cy
      .get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain', 'UNAUTHORIZED');
  });

  it('should not login with invalid username', () => {
    LOGIN_FORM.login('invaliduser', 'invalidpassword');
    cy
      .get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain', 'RESOURCE_NOT_FOUND');
  });
});
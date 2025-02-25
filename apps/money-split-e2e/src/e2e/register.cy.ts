import { TestOwner } from '@angular-monorepo/backdoor';
import { APP, REGISTER_FORM } from '../support/app.po';
import { ENV } from '../support/config';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;

describe('Register Component', () => {

  beforeEach(async () => {
    const testOwner = new TestOwner(
      DATA_PROVIDER_URL,
      'testuser',
      'testpassword',
    );
    await testOwner.dispose();
  });

  it('displays the register form', () => {
    cy.visit('/register'); // visit the page where the register component is located
    cy.get('[data-testid="register-form"]') // check that the register form is displayed
      .should('be.visible');
  });

  it('requires a username', () => {
    cy.visit('/register'); // visit the page where the register component is located
    cy.get('[data-testid="username-input"]') // check that the username input has an error message
      .parent()
      .find('[data-cy="error"]')
      .should('be.visible');
  });

  it('requires a password', () => {
    cy.visit('/register'); // visit the page where the register component is located
    cy.get('[data-testid="password-input"]') // check that the password input has an error message
      .parent()
      .find('[data-cy="error"]')
      .should('be.visible');
  });

  it('registers a new user', () => {
    cy.visit('/register'); // visit the page where the register component is located
    REGISTER_FORM.register('testuser', 'testpassword');
    cy.url()
      .should('contain', 'login');
  });

  it('does not register a user with an username that already exists', () => {
    cy.visit('/register'); // visit the page where the register component is located
    REGISTER_FORM.register('testuser', 'testpassword');
    cy.url()
      .should('contain', 'login');
    cy.visit('/register'); // visit the page where the register component is located
    REGISTER_FORM.register('testuser', 'testpassword');        cy.get('[data-testid="register-button"]'); // click the register button
    cy
      .get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain', 'Uporabniško ime že obstaja');
  });

  it('should show a loader while registering', () => {
    cy.visit('/register');
    cy.intercept('**/register', { delay: 200 });
    REGISTER_FORM.register('testuser', 'testpassword');
    APP.loaderISvisible();
  });
});
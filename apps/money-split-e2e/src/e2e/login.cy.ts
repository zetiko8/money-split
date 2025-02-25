import { TestOwner } from '@angular-monorepo/backdoor';
import { LOGIN_FORM } from '../support/app.po';
import { ENV } from '../support/config';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;

describe('Login', () => {
  beforeEach(async () => {
    const testOwner = new TestOwner(
      DATA_PROVIDER_URL,
      'testuser',
      'testpassword',
    );
    await testOwner.dispose();
    await testOwner.register();
    cy.visit('/login');
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
      .and('contain', 'UNAUTHORIZED');
  });
});
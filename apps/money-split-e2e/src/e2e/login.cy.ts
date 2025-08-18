import { MockDataMachine } from '@angular-monorepo/backdoor';
import { LOGIN_FORM } from '../support/app.po';
import { ENV } from '../support/config';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;

describe('Login', () => {
  beforeEach(async () => {
    await MockDataMachine.dispose(DATA_PROVIDER_URL, 'testuser');
    await MockDataMachine.createNewOwner(DATA_PROVIDER_URL, 'testuser', 'testpassword');
  });

  it('should login with valid credentials', () => {
    cy.visit('/login');
    LOGIN_FORM.login('testuser', 'testpassword');
    cy.url().should('include', '/realm');
  });

  it('should not login with invalid password', () => {
    cy.visit('/login');
    LOGIN_FORM.login('testuser', 'invalidpassword');
    cy
      .get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain', 'UNAUTHORIZED');
  });

  it('should not login with invalid username', () => {
    cy.visit('/login');
    LOGIN_FORM.login('invaliduser', 'invalidpassword');
    cy
      .get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain', 'UNAUTHORIZED');
  });
});
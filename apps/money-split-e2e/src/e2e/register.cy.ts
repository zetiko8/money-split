import { ACTIONS } from "../support/actions"

describe('Register Component', () => {

    beforeEach(() => {
      ACTIONS.deleteOwner('testuser');
    });

    it('displays the register form', () => {
      cy.visit('/register') // visit the page where the register component is located
      cy.get('[data-testid="register-form"]') // check that the register form is displayed
        .should('be.visible')
    })
  
    it('requires a username', () => {
      cy.visit('/register') // visit the page where the register component is located
      cy.get('[data-testid="register-button"]') // click the register button
        .click()
      cy.get('[data-testid="username-input"]') // check that the username input has an error message
        .parent()
        .find('[data-cy="error"]')
        .should('be.visible')
    })
  
    it('requires a password', () => {
      cy.visit('/register') // visit the page where the register component is located
      cy.get('[data-testid="register-button"]') // click the register button
        .click()
      cy.get('[data-testid="password-input"]') // check that the password input has an error message
        .parent()
        .find('[data-cy="error"]')
        .should('be.visible')
    })
  
    it('registers a new user', () => {
      cy.visit('/register') // visit the page where the register component is located
      cy.get('[data-testid="username-input"]') // enter a username
        .type('testuser')
      cy.get('[data-testid="password-input"]') // enter a password
        .type('testpassword')
      cy.get('[data-testid="register-button"]') // click the register button
        .click()
      cy.url()
        .should('contain', 'login');

        cy.request(
          'DELETE', 
          'http://localhost:3333/cybackdoor/owner/testuser'
          ).then((response) => {
              expect(response.status).to.equal(200);
          });

    });

    it('does not register a user with an username', () => {
      cy.visit('/register') // visit the page where the register component is located
      cy.get('[data-testid="username-input"]') // enter a username
        .type('testuser')
      cy.get('[data-testid="password-input"]') // enter a password
        .type('testpassword')
      cy.get('[data-testid="register-button"]') // click the register button
        .click()
      cy.url()
        .should('contain', 'login')    
        cy.visit('/register') // visit the page where the register component is located
        cy.get('[data-testid="username-input"]') // enter an existing username
          .type('testuser')
        cy.get('[data-testid="password-input"]') // enter a password
          .type('testpassword')
        cy.get('[data-testid="register-button"]') // click the register button
          .click()
        cy
          .get('[data-cy="notification"]')
          .should('be.visible')
          .and('contain', 'RESOURCE_ALREADY_EXISTS')  
      })  
  })
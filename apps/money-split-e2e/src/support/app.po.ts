export const getGreeting = () => cy.get('h1');

export const LOGIN_FORM = {
    login (
        username: string,
        password: string,
    ) {
        cy.get('input[name="username"]').type(username);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();
    },
    registerInstead () {
        cy.get('[data-test="register-link"]')
            .click();
    },
}

export const INVITATION_FORM = {
    accept (
        name: string
    ) {
        cy.get('input[name="name"').type(name);
        cy.get('[data-test="accept-invitation-btn"]').click();
    }
}

export const REGISTER_FORM = {
    register (
        username: string,
        password: string,
    ) {
        cy.get('[data-testid="username-input"]') // enter a username
        .type(username)
      cy.get('[data-testid="password-input"]') // enter a password
        .type(password)
      cy.get('[data-testid="register-button"]') // click the register button
        .click()
    }
}

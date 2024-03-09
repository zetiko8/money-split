import { MNamespace, Owner } from "@angular-monorepo/entities";
import { ACTIONS } from "../support/actions";

describe('Add expense', () => {

    describe('add an expense',() => {
        let owner!: Owner;
        let namespace!: MNamespace;

        before(() => {
    
            ACTIONS.deleteOwner('testuser');
            ACTIONS.deleteOwner('atestuser1');
            ACTIONS.deleteOwner('btestuser2');
            ACTIONS.deleteOwner('ctestuser3');
            ACTIONS.deleteNamespaceByName('testnamespace');
            ACTIONS.deleteInvitation('atestuser1@gmail.com');
            ACTIONS.deleteInvitation('btestuser2@gmail.com');
            ACTIONS.deleteInvitation('ctestuser3@gmail.com');
            ACTIONS.registerOwner('atestuser1', 'testpassword')
            ACTIONS.registerOwner('btestuser2', 'testpassword')
            ACTIONS.registerOwner('ctestuser3', 'testpassword')
            ACTIONS.registerOwner('testuser', 'testpassword')
                .then(ownerRes => {
                    owner = ownerRes;
                    ACTIONS.createNamespace('testnamespace', owner.key)
                        .then(namespaceRes => {
                            namespace = namespaceRes;
                            ACTIONS.invite(
                                ownerRes.key,
                                namespaceRes.id,
                                'atestuser1@gmail.com',
                            );
                            ACTIONS.invite(
                                ownerRes.key,
                                namespaceRes.id,
                                'btestuser2@gmail.com',
                            );
                            ACTIONS.invite(
                                ownerRes.key,
                                namespaceRes.id,
                                'ctestuser3@gmail.com',
                            );
                        })
                });
            ACTIONS.acceptInvitation(
                'atestuser1', 'atestuser1', 'atestuser1@gmail.com')
            ACTIONS.acceptInvitation(
                'btestuser2', 'btestuser2', 'btestuser2@gmail.com')
            ACTIONS.acceptInvitation(
                'ctestuser3', 'ctestuser3', 'ctestuser3@gmail.com')
            ACTIONS.login('testuser', 'testpassword');
        });

        after(() => {
            ACTIONS.deleteOwner('testuser');
            ACTIONS.deleteOwner('atestuser1');
            ACTIONS.deleteOwner('btestuser2');
            ACTIONS.deleteOwner('ctestuser3');
            ACTIONS.deleteNamespaceByName('testnamespace');
            ACTIONS.deleteInvitation('atestuser1@gmail.com');
            ACTIONS.deleteInvitation('btestuser2@gmail.com');
            ACTIONS.deleteInvitation('ctestuser3@gmail.com');
        });

        it('can add an expense', () => {
    
            cy.visit(`/${owner.key}/namespace/${namespace.id}`);
            cy.get('[data-test="add-expense-button"]').click();
            cy.get('[data-testid="currency-input" ]')
                .clear();
            cy.get('[data-testid="currency-input" ]')
                .type('SIT');
            cy.get('[data-testid="cost-input"]')
                .clear();
            cy.get('[data-testid="cost-input"]')
                .type('5.4');
            cy.get('[data-testid="add-benefitor"]')
                .contains('atestuser1')
                .click();
            cy.get('[data-testid="add-benefitor"]')
                .contains('btestuser2')
                .click();
            cy.get('[data-testid="add-benefitor"]')
                .contains('ctestuser3')
                .click();
            cy.get('[data-testid="add-paid-by"]')
                .contains('testuser')
                .click();
            cy.get('[data-test="add-expense-confirm-btn"]').click();
            
            cy.get('[data-test="namespace-record"]')
                .should('have.length', 1);
            cy.get('[data-test="namespace-record"]')
                .eq(0)
                .find('[data-test="payer-avatar"]')
                .should('have.length', 1)
                .eq(0)
                .should('have.attr', 'id')
                .should('equal', 'payer-avatar-testuser');
            cy.get('[data-test="record-cost"]')
                .should('contain.text', '5.4');
            cy.get('[data-test="record-currency"]')
                .should('contain.text', 'SIT');
            cy.get('[data-test="namespace-record"]')
                .eq(0)
                .find('[data-test="benefitor-avatar"]')
                .should('have.length', 3);
            cy.get('[data-test="namespace-record"]')
                .eq(0)
                .find('[data-test="benefitor-avatar"]')
                .eq(0)
                .should('have.attr', 'id')
                .should('equal', 'benefitor-avatar-atestuser1');
            cy.get('[data-test="namespace-record"]')
                .eq(0)
                .find('[data-test="benefitor-avatar"]')
                .eq(1)
                .should('have.attr', 'id')
                .should('equal', 'benefitor-avatar-btestuser2');
            cy.get('[data-test="namespace-record"]')
                .eq(0)
                .find('[data-test="benefitor-avatar"]')
                .eq(2)
                .should('have.attr', 'id')
                .should('equal', 'benefitor-avatar-ctestuser3');
        });
    });

});
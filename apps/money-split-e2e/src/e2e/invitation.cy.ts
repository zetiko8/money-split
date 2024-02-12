import { Invitation, MNamespace, Owner } from "@angular-monorepo/entities";
import { ACTIONS } from "../support/actions";

describe('Invitation', () => {

    describe('can invite a person',() => {
        let owner!: Owner;
        const email = 'test+0002@gmail.com';
        let namespace!: MNamespace;

        before(() => {
    
            ACTIONS.deleteOwner('testuser');
            ACTIONS.deleteNamespaceByName('testnamespace');
            ACTIONS.deleteInvitation(email);
            ACTIONS.registerOwner('testuser', 'testpassword')
                .then(ownerRes => {
                    owner = ownerRes;
                    ACTIONS.createNamespace('testnamespace', owner.key)
                        .then(namespaceRes => {
                           namespace = namespaceRes;
                        })
                });
            ACTIONS.login('testuser', 'testpassword');
        });

        after(() => {
            ACTIONS.deleteOwner('testuser');
            ACTIONS.deleteNamespaceByName('testnamespace');
            ACTIONS.deleteInvitation(email);
        });

        it('can invite a person', () => {
            cy.visit(`/${owner.key}/namespace/${namespace.id}`)
            cy.get('input[name="email"').type(email);
            cy.get('[data-test="invite-btn"]').click();
            cy.get('[data-test="invited-owner"]')
                .should('have.length', 1);
            cy.get('div.list-item')
                .contains(email);
        });
    });

    describe('accept invitation',() => {
        let owner!: Owner;
        let invitation!: Invitation;
        const email = 'test+0002@gmail.com';

        before(() => {
    
            ACTIONS.deleteOwner('testuser');
            ACTIONS.deleteOwner('testuser1');
            ACTIONS.deleteNamespaceByName('testnamespace');
            ACTIONS.deleteInvitation(email);
            ACTIONS.registerOwner('testuser', 'testpassword')
                .then(ownerRes => {
                    owner = ownerRes;
                    ACTIONS.createNamespace('testnamespace', owner.key)
                        .then(namespaceRes => {
                            ACTIONS.invite(
                                owner.key,
                                namespaceRes.id,
                                email,
                            ).then(invitationRes => {
                                invitation = invitationRes;
                            });
                        })
                });
            ACTIONS.registerOwner('testuser1', 'testpassword');
            ACTIONS.login('testuser1', 'testpassword');
        });

        after(() => {
            ACTIONS.deleteOwner('testuser');
            ACTIONS.deleteOwner('testuser1');
            ACTIONS.deleteNamespaceByName('testnamespace');
            ACTIONS.deleteInvitation(email);
        });

        it('can accept invitation', () => {
    
            cy.visit(`/invitation/${invitation.invitationKey}`)
            cy.get('input[name="name"').type(email);
            cy.get('[data-test="accept-invitation-btn"]').click();
    
            cy.url().should('contain', '/namespace/');
            cy.get('[data-test="invited-owner"]')
                .should('have.length', 0);
        });
    });

});
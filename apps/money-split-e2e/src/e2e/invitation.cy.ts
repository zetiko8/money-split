import { Invitation, MNamespace, Owner } from '@angular-monorepo/entities';
import { ACTIONS } from '../support/actions';
import { INVITATION_FORM, LOGIN_FORM, NAMESPACE_SCREEN, REGISTER_FORM } from '../support/app.po';

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
            });
        });
      ACTIONS.login('testuser', 'testpassword');
    });

    after(() => {
      ACTIONS.deleteOwner('testuser');
      ACTIONS.deleteNamespaceByName('testnamespace');
      ACTIONS.deleteInvitation(email);
    });

    it('can invite a person', () => {
      cy.visit(`/${owner.key}/namespace/${namespace.id}`);
      cy.get('[data-test="add-user-button"]').click();
      cy.get('input[name="email"').type(email);
      cy.get('[data-test="invite-btn"]').click();
      cy.get('[data-test="number-of-invited-users"]')
        .should('contain.text', '(1)');
      cy.get('[data-test="invited-owner"]')
        .should('have.length', 1);
      cy.get('[data-test="invited-owner"]')
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
            });
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

      cy.visit(`/invitation/${invitation.invitationKey}/join`);
      INVITATION_FORM.accept(email);
      cy.url().should('contain', '/namespace/');
      NAMESPACE_SCREEN.openMembersTab();
      cy.get('[data-test="number-of-invited-users"]')
        .should('contain.text', '(0)');
      cy.get('[data-test="invited-owner"]')
        .should('have.length', 0);
    });
  });

  describe('accept invitation - guest that already has profile',() => {
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
            });
        });
      ACTIONS.registerOwner('testuser1', 'testpassword');
    });

    after(() => {
      ACTIONS.deleteOwner('testuser');
      ACTIONS.deleteOwner('testuser1');
      ACTIONS.deleteNamespaceByName('testnamespace');
      ACTIONS.deleteInvitation(email);
    });

    it('can accept invitation, but must login first', () => {

      cy.visit(`/invitation/${invitation.invitationKey}/join`);
      cy.get('[data-test="accept-invitation-btn"]').click();

      LOGIN_FORM.login('testuser1', 'testpassword');
      INVITATION_FORM.accept(email);
      NAMESPACE_SCREEN.openMembersTab();
      cy.url().should('contain', '/namespace/');
      cy.get('[data-test="number-of-invited-users"]')
        .should('contain.text', '(0)');
      cy.get('[data-test="invited-owner"]')
        .should('have.length', 0);
    });
  });

  describe('accept invitation - guest that doesn\'t jet have a profile',() => {
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
            });
        });
    });

    after(() => {
      ACTIONS.deleteOwner('testuser');
      ACTIONS.deleteOwner('testuser1');
      ACTIONS.deleteNamespaceByName('testnamespace');
      ACTIONS.deleteInvitation(email);
    });

    it('can accept invitation, but must register and login first', () => {

      cy.visit(`/invitation/${invitation.invitationKey}/join`);
      cy.get('[data-test="accept-invitation-btn"]').click();

      LOGIN_FORM.registerInstead();
      REGISTER_FORM.register('testuser1', 'testpassword');
      LOGIN_FORM.login('testuser1', 'testpassword');
      INVITATION_FORM.accept(email);
      NAMESPACE_SCREEN.openMembersTab();
      cy.url().should('contain', '/namespace/');
      cy.get('[data-test="number-of-invited-users"]')
        .should('contain.text', '(0)');
      cy.get('[data-test="invited-owner"]')
        .should('have.length', 0);
    });
  });

});
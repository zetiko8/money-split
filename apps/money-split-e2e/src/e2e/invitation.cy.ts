import { ACTIONS } from '../support/actions';
import { INVITATION_FORM, LOGIN_FORM, NAMESPACE_SCREEN, REGISTER_FORM } from '../support/app.po';
import { MockDataMachine, TestOwner } from '@angular-monorepo/backdoor';
import { ENV } from '../support/config';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;

describe('Invitation', () => {

  describe('can invite a person',() => {
    const email = 'test+0002@gmail.com';
    let testOwner!: TestOwner;
    let namespaceId!: number;
    let ownerKey!: string;
    let token!: string;

    beforeEach(async () => {
      // Clean up existing test data
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'testowner');

      // Create test owner using MockDataMachine
      testOwner = await MockDataMachine.createNewOwnerAndLogHimIn(DATA_PROVIDER_URL, 'testowner', 'testpassword');
      const namespace = await testOwner.createNamespace('testnamespace1');
      namespaceId = namespace.id;
      ownerKey = testOwner.owner.key;
      token = testOwner.token;
    });

    it('can invite a person', () => {
      ACTIONS.loginTestOwnerWithToken(token);
      cy.visit(`/${ownerKey}/namespace/${namespaceId}`);
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

  describe('accept invitation - already logged in',() => {
    const email = 'test@email.com';
    let namespaceId!: number;
    let testOwner!: TestOwner;
    let creatorOwner!: TestOwner;
    let invitationKey!: string;
    let token!: string;
    beforeEach(async () => {
      try {
        // Clean up existing test data
        await MockDataMachine.dispose(DATA_PROVIDER_URL, 'creator');
        await MockDataMachine.dispose(DATA_PROVIDER_URL, 'invitedowner');

        // Create creator owner and namespace
        creatorOwner = await MockDataMachine.createNewOwnerAndLogHimIn(DATA_PROVIDER_URL, 'creator', 'testpassword');
        const namespace = await creatorOwner.createNamespace('testnamespace');
        namespaceId = namespace.id;

        // Create invitation
        const invitation = await creatorOwner.inviteToNamespace('test@email.com', namespaceId);
        invitationKey = invitation.invitationKey;

        // Create test owner
        testOwner = await MockDataMachine.createNewOwnerAndLogHimIn(DATA_PROVIDER_URL, 'invitedowner', 'testpassword');
        token = testOwner.token;
      } catch (error) {
        throw Error('beforeAll error: ' + (error as Error).message);
      }
    });

    it('can accept invitation', () => {
      ACTIONS.loginTestOwnerWithToken(token);
      cy.visit(`/invitation/${invitationKey}/join`);
      INVITATION_FORM.accept(email);
      cy.url().should('contain', '/namespace/');
      NAMESPACE_SCREEN.openMembersTab();
      cy.get('[data-test="number-of-invited-users"]')
        .should('contain.text', '(0)');
      cy.get('[data-test="invited-owner"]')
        .should('have.length', 0);
    });

    it('username length validation', () => {
      ACTIONS.loginTestOwnerWithToken(token);
      cy.visit(`/invitation/${invitationKey}/join`);
      INVITATION_FORM.setName('a'.repeat(21));
      INVITATION_FORM.expectNameMaxLengthError();
      INVITATION_FORM.expectSubmitButtonToBeDisabled();
    });

    it('username trim validation', () => {
      ACTIONS.loginTestOwnerWithToken(token);
      cy.visit(`/invitation/${invitationKey}/join`);
      INVITATION_FORM.setName('   ');
      INVITATION_FORM.expectSubmitButtonToBeDisabled();
    });
  });

  describe('accept invitation - guest that already has profile',() => {
    const email = 'test2@email.com';
    let invitationKey!: string;
    beforeEach(async () => {

      // Clean up existing test data
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'creator');
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'invitedowner');

      // Create creator owner and namespace
      const machine = new MockDataMachine(DATA_PROVIDER_URL);
      await machine.createNewCluster('creator', 'testpassword');
      await machine.createNewNamespace('testnamespace');
      const state = await machine.createNewInvitation('test@email.com');

      // Create invitation
      const invitation = state.getInvitationByEmail('test@email.com');
      invitationKey = invitation.invitationKey;

    });

    it('can accept invitation, but must login first', () => {
      cy.visit(`/invitation/${invitationKey}/join`);
      cy.get('[data-test="accept-invitation-btn"]').click();

      LOGIN_FORM.login('test@email.com', 'testpassword');
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
    const email = 'test2@email.com';
    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let invitationKey!: string;

    beforeEach(async () => {
      // Clean up existing test data
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'creator');
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'invitedowner');

      // Create creator owner and namespace
      creatorOwner = await MockDataMachine.createNewOwnerAndLogHimIn(DATA_PROVIDER_URL, 'creator', 'testpassword');
      const namespace = await creatorOwner.createNamespace('testnamespace');
      namespaceId = namespace.id;

      // Create invitation
      const invitation = await creatorOwner.inviteToNamespace('test@email.com', namespaceId);
      invitationKey = invitation.invitationKey;
    });

    it('can accept invitation, but must register and login first', () => {

      cy.visit(`/invitation/${invitationKey}/join`);
      cy.get('[data-test="accept-invitation-btn"]').click();

      LOGIN_FORM.registerInstead();
      REGISTER_FORM.register('invitedowner', 'testpassword');
      LOGIN_FORM.login('invitedowner', 'testpassword');
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
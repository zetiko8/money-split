import { ACTIONS } from '../support/actions';
import { INVITATION_FORM, LOGIN_FORM, NAMESPACE_SCREEN, REGISTER_FORM } from '../support/app.po';
import { MockDataMachine2, TestOwner } from '@angular-monorepo/backdoor';
import { ENV } from '../support/config';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;
const BACKDOOR_USERNAME = ENV().BACKDOOR_USERNAME;
const BACKDOOR_PASSWORD = ENV().BACKDOOR_PASSWORD;

describe('Invitation', () => {

  describe('Invite form',() => {
    let namespaceId!: number;
    let ownerKey!: string;
    let token!: string;

    beforeEach(async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');

      ownerKey = machine.getOwner('creator-owner').key;
      namespaceId = machine.getNamespace('namespace1').id;
      token = await machine.loginOwner('creator-owner');
    });

    it('can invite a person', () => {
      const email = 'test+0002@gmail.com';

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

    it('email must be valid', () => {
      ACTIONS.loginTestOwnerWithToken(token);
      cy.visit(`/${ownerKey}/namespace/${namespaceId}/invite`);

      cy.get('input[name="email"').type('test+0002gmail.com');
      cy.get('[data-test="invite-btn"]').should('be.disabled');
      cy.get('input[name="email"').parent().find('.error')
        .should('contain.text', 'Neveljaven e-poštni naslov');

      cy.get('input[name="email"').clear();
      cy.get('input[name="email"').type('test+0002@gmail.com');
      cy.get('[data-test="invite-btn"]').should('not.be.disabled');
      cy.get('input[name="email"').parent().find('.error')
        .should('not.exist');
    });

    it('email must not be to long', () => {
      ACTIONS.loginTestOwnerWithToken(token);
      cy.visit(`/${ownerKey}/namespace/${namespaceId}/invite`);

      cy.get('input[name="email"').type('a'.repeat(65) + '@test.com');
      cy.get('[data-test="invite-btn"]').should('be.disabled');
      cy.get('input[name="email"').parent().find('.error')
        .should('contain.text', 'Neveljaven e-poštni naslov');

      cy.get('input[name="email"').clear();
      cy.get('input[name="email"').type('a'.repeat(64) + '@test.com');
      cy.get('[data-test="invite-btn"]').should('not.be.disabled');
      cy.get('input[name="email"').parent().find('.error')
        .should('not.exist');
    });
  });

  describe('accept invitation - already logged in',() => {
    const email = 'test@email.com';
    let invitationKey!: string;
    let token!: string;
    beforeEach(async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');
      const invitation = await machine.inviteToNamespace('creator-owner', 'namespace1', email);

      invitationKey = invitation.invitationKey;
      token = await machine.loginOwner('namespace-owner1');
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

  describe('accept invitation - creator owner wants to accept its own invitation',() => {
    const email = 'test@email.com';
    let invitationKey!: string;
    let token!: string;
    beforeEach(async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');
      const invitation = await machine.inviteToNamespace('creator-owner', 'namespace1', email);

      invitationKey = invitation.invitationKey;
      token = await machine.loginOwner('creator-owner');
    });

    it('can accept invitation', () => {

      // TODO - tole bo potrebno premisliti
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
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1', 'testpassword');

      await machine.createNamespace('creator-owner', 'namespace1');
      const invitation = await machine.inviteToNamespace('creator-owner', 'namespace1', email);

      invitationKey = invitation.invitationKey;
    });

    it('can accept invitation, but must login first', () => {
      cy.visit(`/invitation/${invitationKey}/join`);
      cy.get('[data-test="accept-invitation-btn"]').click();

      LOGIN_FORM.login('namespace-owner1', 'testpassword');
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
    let invitationKey!: string;
    beforeEach(async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await TestOwner.dispose(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, 'invitedowner');

      await machine.createNamespace('creator-owner', 'namespace1');
      const invitation = await machine.inviteToNamespace('creator-owner', 'namespace1', email);

      invitationKey = invitation.invitationKey;
    });

    it('can accept invitation, but must register and login first', () => {

      cy.visit(`/invitation/${invitationKey}/join`);
      cy.get('[data-test="accept-invitation-btn"]').click();

      LOGIN_FORM.registerInstead();
      REGISTER_FORM.register('invitedowner', 'testpassword');

      LOGIN_FORM.isOnLoginForm();
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
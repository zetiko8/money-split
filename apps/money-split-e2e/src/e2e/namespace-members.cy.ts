import { ACTIONS } from '../support/actions';
import { NAMESPACE_SCREEN } from '../support/app.po';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';
import { ENV } from '../support/config';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;
const BACKDOOR_USERNAME = ENV().BACKDOOR_USERNAME;
const BACKDOOR_PASSWORD = ENV().BACKDOOR_PASSWORD;

describe('Namespace members view', () => {

  describe('invitees',() => {
    let namespaceId!: number;
    let ownerKey!: string;
    let token!: string;
    let machine!: MockDataMachine2;

    beforeEach(async () => {
      machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');

      await machine.inviteToNamespace('creator-owner', 'namespace1', 'test+0002@gmail.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'test+0003@gmail.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'test+0004@gmail.com');

      ownerKey = machine.getOwner('creator-owner').key;
      namespaceId = machine.getNamespace('namespace1').id;
      token = await machine.loginOwner('creator-owner');
    });

    it('has list of all invitees', () => {
      ACTIONS.loginTestOwnerWithToken(token);
      NAMESPACE_SCREEN.visit(ownerKey, namespaceId);

      cy.get('[data-test="number-of-invited-users"]')
        .should('contain.text', '(3)');
      cy.get('[data-test="invited-owner"]')
        .should('have.length', 3);
    });

    it('handles to long emails', () => {

      const longEmail = 'a'.repeat(64) + '@test.com';

      new Cypress.Promise(async resolve => {
        await machine.inviteToNamespace('creator-owner', 'namespace1', longEmail);
        await machine.inviteToNamespace('creator-owner', 'namespace1', 'test+0005@gmail.com');
        await machine.inviteToNamespace('creator-owner', 'namespace1', 'test+0006@gmail.com');
        resolve();
      }).then(() => {
        ACTIONS.loginTestOwnerWithToken(token);
        NAMESPACE_SCREEN.visit(ownerKey, namespaceId);

        cy.get('[data-test="number-of-invited-users"]')
          .should('contain.text', '(6)');
        cy.get('[data-test="invited-owner"]')
          .eq(3)
          .should('have.text', ' aaaaaaaaaaaaaaaaaaa...aaaaaaaaaa@test.com ');
      });
    });

  });

});
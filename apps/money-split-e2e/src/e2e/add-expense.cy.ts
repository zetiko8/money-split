import { NAMESPACE_SCREEN, RECORD_FORM, RECORD_LIST } from '../support/app.po';
import * as moment from 'moment';
import { TestOwner } from '@angular-monorepo/backdoor';
import { ACTIONS } from '../support/actions';

const DATA_PROVIDER_URL = Cypress.env()['DATA_PROVIDER_URL'];

describe('Add expense', () => {

  describe('add an expense',() => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;

    before(async () => {
      creatorOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'testuser',
        'testpassword',
      );
      await creatorOwner.dispose();
      await creatorOwner.register();

      const namespace = await creatorOwner.createNamespace('testnamespace');
      namespaceId = namespace.id;

      await creatorOwner.addOwnerToNamespace(
        namespaceId,
        {
          name: 'atestuser1',
        },
      );
      await creatorOwner.addOwnerToNamespace(
        namespaceId,
        {
          name: 'btestuser2',
        },
      );
      await creatorOwner.addOwnerToNamespace(
        namespaceId,
        {
          name: 'ctestuser3',
        },
      );

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('can add an expense', () => {

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.setCurrency('SIT');
      RECORD_FORM.setCost('5.4');
      RECORD_FORM.clickBenefitor('atestuser1');
      RECORD_FORM.clickBenefitor('btestuser2');
      RECORD_FORM.clickBenefitor('ctestuser3');
      RECORD_FORM.clickPaidBy('testuser');
      RECORD_FORM.confirm();

      RECORD_LIST.shouldHaveNumberOfRecords(1);
      RECORD_LIST.RECORD(0)
        .shouldHaveNumberOfPayers(1);
      RECORD_LIST.RECORD(0).PAYER(0)
        .hasId('payer-avatar-testuser');
      RECORD_LIST.RECORD(0).shouldHaveCost('5.4');
      RECORD_LIST.RECORD(0).shouldHaveCurrency('SIT');
      RECORD_LIST.RECORD(0)
        .shouldHaveNumberOfBenefitors(3);
      RECORD_LIST.RECORD(0).BENEFITOR(0)
        .hasId('benefitor-avatar-atestuser1');
      RECORD_LIST.RECORD(0).BENEFITOR(1)
        .hasId('benefitor-avatar-btestuser2');
      RECORD_LIST.RECORD(0).BENEFITOR(2)
        .hasId('benefitor-avatar-ctestuser3');
    });
  });

  describe('add a second expense',() => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;

    before(async () => {
      creatorOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'testuser',
        'testpassword',
      );
      await creatorOwner.dispose();
      await creatorOwner.register();

      const namespace = await creatorOwner.createNamespace('testnamespace');
      namespaceId = namespace.id;

      const creatorUser
      = await creatorOwner.getUserForNamespace(namespaceId);

      const benefitors = [
        (await ((await creatorOwner.addOwnerToNamespace(
          namespaceId,
          {
            name: 'atestuser1',
          },
        )).getUserForNamespace(namespaceId))).id,
        (await ((await creatorOwner.addOwnerToNamespace(
          namespaceId,
          {
            name: 'btestuser2',
          },
        )).getUserForNamespace(namespaceId))).id,
        (await ((await creatorOwner.addOwnerToNamespace(
          namespaceId,
          {
            name: 'ctestuser3',
          },
        )).getUserForNamespace(namespaceId))).id,
      ];

      await creatorOwner.backdoorLogin({
        username: Cypress.env()['BACKDOOR_USERNAME'],
        password: Cypress.env()['BACKDOOR_PASSWORD'],
      });
      await creatorOwner.addRecordToNamespace(namespaceId, {
        benefitors,
        cost: 5.4,
        currency: 'SIT',
        paidBy: [creatorUser.id],
        created: moment().subtract(2, 'hours').toDate(),
        edited: moment().subtract(2, 'hours').toDate(),
        addingOwnerId: creatorOwner.owner.id,
        addingUserId: creatorUser.id,
      });

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('can add an additional expense', () => {

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.setCurrency('SIT');
      RECORD_FORM.setCost('10');
      RECORD_FORM.clickBenefitor('atestuser1');
      RECORD_FORM.clickBenefitor('btestuser2');
      RECORD_FORM.clickBenefitor('ctestuser3');
      RECORD_FORM.clickPaidBy('testuser');
      RECORD_FORM.confirm();
      RECORD_LIST.RECORD(0).shouldHaveCost('10');
      RECORD_LIST.RECORD(1).shouldHaveCost('5.4');
    });
  });

});
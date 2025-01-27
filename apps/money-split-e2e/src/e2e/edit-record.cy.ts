import { NAMESPACE_SCREEN, RECORD_FORM, RECORD_LIST } from '../support/app.po';
import * as moment from 'moment';
import { TestOwner } from '@angular-monorepo/backdoor';
import { ACTIONS } from '../support/actions';

const DATA_PROVIDER_URL = Cypress.env()['DATA_PROVIDER_URL'];

describe('Add expense', () => {

  describe.only('edit a record',() => {
    const firstDate = moment().set({
      year: 2024,
      month: 2,
      date: 15,
    }).toDate();

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
        cost: 4,
        currency: 'SIT',
        paidBy: [creatorUser.id],
        created:firstDate,
        edited:firstDate,
        addingOwnerId: creatorOwner.owner.id,
        addingUserId: creatorUser.id,
      });

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('can edit an expense', () => {

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      RECORD_LIST.RECORD(0).goToEdit();
      RECORD_FORM.currencyIsSetTo('SIT');
      RECORD_FORM.costIsSetTo('4');
      RECORD_FORM.BENEFITORS.areSelected([
        'atestuser1',
        'btestuser2',
        'ctestuser3',
      ]);
      RECORD_FORM.BENEFITORS.areNotSelected([
        'testuser',
      ]);
      RECORD_FORM.PAID_BY.areSelected([
        'testuser',
      ]);
      RECORD_FORM.PAID_BY.areNotSelected([
        'atestuser1',
        'btestuser2',
        'ctestuser3',
      ]);
      RECORD_FORM.setCurrency('EUR');
      RECORD_FORM.setCost('10');
      RECORD_FORM.clickBenefitor('atestuser1');
      RECORD_FORM.clickBenefitor('btestuser2');
      RECORD_FORM.clickBenefitor('ctestuser3');
      RECORD_FORM.clickBenefitor('testuser');
      RECORD_FORM.clickPaidBy('testuser');
      RECORD_FORM.clickPaidBy('atestuser1');
      RECORD_FORM.confirm();

      RECORD_LIST.shouldHaveNumberOfRecords(1);
      RECORD_LIST.RECORD(0)
        .shouldHaveNumberOfPayers(1);
      RECORD_LIST.RECORD(0).PAYER(0)
        .hasId('payer-avatar-atestuser1');
      RECORD_LIST.RECORD(0).shouldHaveCost('10');
      RECORD_LIST.RECORD(0).shouldHaveCurrency('EUR');
      RECORD_LIST.RECORD(0)
        .shouldHaveNumberOfBenefitors(1);
      RECORD_LIST.RECORD(0).BENEFITOR(0)
        .hasId('benefitor-avatar-testuser');
    });
  });
});
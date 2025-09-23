import { NAMESPACE_SCREEN, RECORD_LIST, SETTLE_PREVIEW_SCREEN, SETTLE_SETTINGS_SCREEN } from '../support/app.po';
import * as moment from 'moment';
import { ACTIONS } from '../support/actions';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';
import { ENV } from '../support/config';
import { NamespaceView, Owner } from '@angular-monorepo/entities';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;

describe('Settle', () => {

  describe('settle button is not displayed when there are no records',() => {
    let namespaceId!: number;
    let creatorOwner!: Owner;
    let creatorOwnerToken!: string;

    before(async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, ENV().BACKDOOR_USERNAME, ENV().BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      creatorOwner = await machine.getOwner('creator-owner');
      namespaceId = machine.getNamespace('namespace1').id;
      creatorOwnerToken = await machine.loginOwner('creator-owner');
    });

    it('settle button is not visible', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwnerToken);
      NAMESPACE_SCREEN.visit(creatorOwner.key, namespaceId);
      NAMESPACE_SCREEN.openRecordsListTab();
      RECORD_LIST.settleButton.isNotVisible();
    });
  });

  describe('settle button is not displayed all the records are settled', () => {
    const settleDate = moment().set({
      year: 2024,
      month: 2,
      date: 15,
    }).add(2, 'hours').toDate();

    let namespaceId!: number;
    let creatorOwner!: Owner;
    let creatorOwnerToken!: string;

    before(async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, ENV().BACKDOOR_USERNAME, ENV().BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      creatorOwner = await machine.getOwner('creator-owner');
      namespaceId = machine.getNamespace('namespace1').id;
      creatorOwnerToken = await machine.loginOwner('creator-owner');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [
          { user: 'namespace-owner1', amount: 100, currency: 'EUR' },
          { user: 'creator-owner', amount: 250, currency: 'SIT' },
        ],
        benefitors: [
          { user: 'namespace-owner2', amount: 33.33, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 33.33, currency: 'EUR' },
          { user: 'creator-owner', amount: 33.34, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 250, currency: 'SIT' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      await machine.settleRecords(
        'creator-owner',
        'namespace1',
        'creator-owner',
        {
          separatedSettlementPerCurrency: true,
          currencies: {
            EUR: 1,
            SIT: 1,
          },
          mainCurrency: 'EUR',
          paymentEvents: machine.getNamespacePaymentEventIds('namespace1'),
        },
        settleDate,
      );
    });

    it('settle button is not visible', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwnerToken);
      NAMESPACE_SCREEN.visit(creatorOwner.key, namespaceId);
      NAMESPACE_SCREEN.openRecordsListTab();
      RECORD_LIST.settleButton.isNotVisible();
    });
  });

  describe('can settle',() => {
    let namespace!: NamespaceView;
    let creatorOwner!: Owner;
    let creatorOwnerToken!: string;

    before(async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, ENV().BACKDOOR_USERNAME, ENV().BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      creatorOwner = await machine.getOwner('creator-owner');
      namespace = machine.getNamespace('namespace1');
      creatorOwnerToken = await machine.loginOwner('creator-owner');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [
          { user: 'namespace-owner1', amount: 100, currency: 'EUR' },
          { user: 'creator-owner', amount: 250, currency: 'SIT' },
        ],
        benefitors: [
          { user: 'namespace-owner2', amount: 33.33, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 33.33, currency: 'EUR' },
          { user: 'creator-owner', amount: 33.34, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 250, currency: 'SIT' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });
    });

    it('can settle', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwnerToken);
      NAMESPACE_SCREEN.visit(creatorOwner.key, namespace.id);
      NAMESPACE_SCREEN.openRecordsListTab();
      RECORD_LIST.settleButton.click();
      SETTLE_SETTINGS_SCREEN.settleConfirmButton.click();
      SETTLE_PREVIEW_SCREEN.settleButton.click();
      NAMESPACE_SCREEN.userIsOn(namespace.name);

      RECORD_LIST.SETTLEMENT(0).isSettledOn(new Date());
      RECORD_LIST.SETTLEMENT(0).RECORD(0).IN_DEBT()
        .hasId('benefitor-avatar-creator-owner');
      RECORD_LIST.SETTLEMENT(0).RECORD(0).DEBT_TO()
        .hasId('payer-avatar-namespace-owner1');
      RECORD_LIST.SETTLEMENT(0).RECORD(0)
        .shouldHaveDebtAmount('33.33');
      RECORD_LIST.SETTLEMENT(0).RECORD(0)
        .shouldHaveCurrency('EUR');
      RECORD_LIST.SETTLEMENT(0).isSettledOn(new Date());

      RECORD_LIST.SETTLEMENT(0).RECORD(1).IN_DEBT()
        .hasId('benefitor-avatar-namespace-owner2');
      RECORD_LIST.SETTLEMENT(0).RECORD(1).DEBT_TO()
        .hasId('payer-avatar-namespace-owner1');
      RECORD_LIST.SETTLEMENT(0).RECORD(1)
        .shouldHaveDebtAmount('33.33');
      RECORD_LIST.SETTLEMENT(0).RECORD(1)
        .shouldHaveCurrency('EUR');

      RECORD_LIST.SETTLEMENT(0).RECORD(2).IN_DEBT()
        .hasId('benefitor-avatar-namespace-owner1');
      RECORD_LIST.SETTLEMENT(0).RECORD(2).DEBT_TO()
        .hasId('payer-avatar-creator-owner');
      RECORD_LIST.SETTLEMENT(0).RECORD(2)
        .shouldHaveDebtAmount('250.00');
      RECORD_LIST.SETTLEMENT(0).RECORD(2)
        .shouldHaveCurrency('SIT');
    });
  });

  describe('can settle and unsettle a settle debt', () => {
    const settleDate = moment().set({
      year: 2024,
      month: 2,
      date: 15,
    }).add(2, 'hours').toDate();

    let namespace!: NamespaceView;
    let creatorOwner!: Owner;
    let creatorOwnerToken!: string;

    before(async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, ENV().BACKDOOR_USERNAME, ENV().BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      creatorOwner = await machine.getOwner('creator-owner');
      namespace = machine.getNamespace('namespace1');
      creatorOwnerToken = await machine.loginOwner('creator-owner');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [
          { user: 'namespace-owner1', amount: 100, currency: 'EUR' },
          { user: 'creator-owner', amount: 250, currency: 'SIT' },
        ],
        benefitors: [
          { user: 'namespace-owner2', amount: 33.33, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 33.33, currency: 'EUR' },
          { user: 'creator-owner', amount: 33.34, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 250, currency: 'SIT' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      await machine.settleRecords(
        'creator-owner',
        'namespace1',
        'creator-owner',
        {
          separatedSettlementPerCurrency: true,
          currencies: {
            EUR: 1,
            SIT: 1,
          },
          mainCurrency: 'EUR',
          paymentEvents: machine.getNamespacePaymentEventIds('namespace1'),
        },
        settleDate,
      );
    });

    it('settle and unsettle', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwnerToken);
      NAMESPACE_SCREEN.visit(creatorOwner.key, namespace.id);
      NAMESPACE_SCREEN.openRecordsListTab();
      RECORD_LIST.SETTLEMENT(0).RECORD(0)
        .toggleSettled();
      RECORD_LIST.SETTLEMENT(0).RECORD(0)
        .isSettled();
      RECORD_LIST.SETTLEMENT(0).RECORD(0)
        .toggleSettled();
      RECORD_LIST.SETTLEMENT(0).RECORD(0)
        .isNotSettled();
    });
  });

  describe('settlement is marked as settled when all the debts are settled', () => {
    const settleDate = moment().set({
      year: 2024,
      month: 2,
      date: 15,
    }).add(2, 'hours').toDate();

    let namespace!: NamespaceView;
    let creatorOwner!: Owner;
    let creatorOwnerToken!: string;

    before(async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, ENV().BACKDOOR_USERNAME, ENV().BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      creatorOwner = await machine.getOwner('creator-owner');
      namespace = machine.getNamespace('namespace1');
      creatorOwnerToken = await machine.loginOwner('creator-owner');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [
          { user: 'namespace-owner1', amount: 100, currency: 'EUR' },
          { user: 'creator-owner', amount: 250, currency: 'SIT' },
        ],
        benefitors: [
          { user: 'namespace-owner2', amount: 33.33, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 33.33, currency: 'EUR' },
          { user: 'creator-owner', amount: 33.34, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 250, currency: 'SIT' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      await machine.settleRecords(
        'creator-owner',
        'namespace1',
        'creator-owner',
        {
          separatedSettlementPerCurrency: true,
          currencies: {
            EUR: 1,
            SIT: 1,
          },
          mainCurrency: 'EUR',
          paymentEvents: machine.getNamespacePaymentEventIds('namespace1'),
        },
        settleDate,
      );
    });

    it('is-all-settled', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwnerToken);
      NAMESPACE_SCREEN.visit(creatorOwner.key, namespace.id);
      NAMESPACE_SCREEN.openRecordsListTab();
      RECORD_LIST.SETTLEMENT(0).RECORD(0)
        .toggleSettled();
      RECORD_LIST.SETTLEMENT(0).RECORD(1)
        .toggleSettled();
      RECORD_LIST.SETTLEMENT(0).RECORD(2)
        .toggleSettled();
      RECORD_LIST.SETTLEMENT(0)
        .shouldBeSettled();
    });
  });
});
import { NAMESPACE_SCREEN, RECORD_LIST, SETTLE_PREVIEW_SCREEN } from '../support/app.po';
import * as moment from 'moment';
import { ACTIONS } from '../support/actions';
import { BACKDOOR_ACTIONS, TestOwner, TestScenarioNamespace } from '@angular-monorepo/backdoor';
import { ENV } from '../support/config';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;

describe('Settle', () => {

  describe('settle button is not displayed when there are no records',() => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;

    before(async () => {
      scenario = await BACKDOOR_ACTIONS.SCENARIO.prepareNamespace(
        DATA_PROVIDER_URL,
        ENV().BACKDOOR_USERNAME,
        ENV().BACKDOOR_PASSWORD,
        'testnamespace',
        {  username: 'testuser'},
        [
          {  username: 'atestuser1'},
          {  username: 'btestuser2'},
          {  username: 'ctestuser3'},
        ],
        [],
      );

      creatorOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('settle button is not visible', () => {
      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
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
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;

    before(async () => {
      scenario = await BACKDOOR_ACTIONS.SCENARIO.scenarios[1](
        moment,
        DATA_PROVIDER_URL,
        ENV().BACKDOOR_USERNAME,
        ENV().BACKDOOR_PASSWORD,
      );

      creatorOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;

      await creatorOwner.settleRecords(
        namespaceId,
        scenario.creator.user.id,
        scenario.addedRecords.map(r => r.id),
        settleDate,
      );

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('settle button is not visible', () => {
      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.openRecordsListTab();
      RECORD_LIST.settleButton.isNotVisible();
    });
  });

  describe('can settle',() => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;

    before(async () => {
      scenario = await BACKDOOR_ACTIONS.SCENARIO.scenarios[1](
        moment,
        DATA_PROVIDER_URL,
        ENV().BACKDOOR_USERNAME,
        ENV().BACKDOOR_PASSWORD,
      );

      creatorOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;

    });

    it('can settle', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);
      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.openRecordsListTab();
      RECORD_LIST.settleButton.click();
      SETTLE_PREVIEW_SCREEN.settleButton.click();
      NAMESPACE_SCREEN.userIsOn(scenario.namespace.name);

      RECORD_LIST.SETTLEMENT(0).isSettledOn(new Date());
      RECORD_LIST.SETTLEMENT(0).RECORD(0).IN_DEBT()
        .hasId('benefitor-avatar-atestuser1');
      RECORD_LIST.SETTLEMENT(0).RECORD(0).DEBT_TO()
        .hasId('payer-avatar-testuser');
      RECORD_LIST.SETTLEMENT(0).RECORD(0)
        .shouldHaveDebtAmount('7.47');
      RECORD_LIST.SETTLEMENT(0).RECORD(0)
        .shouldHaveCurrency('SIT');
      RECORD_LIST.SETTLEMENT(0).RECORD(1).IN_DEBT()
        .hasId('benefitor-avatar-btestuser2');
      RECORD_LIST.SETTLEMENT(0).RECORD(1).DEBT_TO()
        .hasId('payer-avatar-testuser');
      RECORD_LIST.SETTLEMENT(0).RECORD(1)
        .shouldHaveDebtAmount('7.47');
      RECORD_LIST.SETTLEMENT(0).RECORD(1)
        .shouldHaveCurrency('SIT');
      RECORD_LIST.SETTLEMENT(0).RECORD(2).IN_DEBT()
        .hasId('benefitor-avatar-ctestuser3');
      RECORD_LIST.SETTLEMENT(0).RECORD(2).DEBT_TO()
        .hasId('payer-avatar-testuser');
      RECORD_LIST.SETTLEMENT(0).RECORD(2)
        .shouldHaveDebtAmount('7.47');
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

    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;

    before(async () => {
      scenario = await BACKDOOR_ACTIONS.SCENARIO.scenarios[1](
        moment,
        DATA_PROVIDER_URL,
        ENV().BACKDOOR_USERNAME,
        ENV().BACKDOOR_PASSWORD,
      );

      creatorOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;

      await creatorOwner.settleRecords(
        namespaceId,
        scenario.creator.user.id,
        scenario.addedRecords.map(r => r.id),
        settleDate,
      );

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('settle and unsettle', () => {
      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
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

    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;

    before(async () => {
      scenario = await BACKDOOR_ACTIONS.SCENARIO.scenarios[1](
        moment,
        DATA_PROVIDER_URL,
        ENV().BACKDOOR_USERNAME,
        ENV().BACKDOOR_PASSWORD,
      );

      creatorOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;

      await creatorOwner.settleRecords(
        namespaceId,
        scenario.creator.user.id,
        scenario.addedRecords.map(r => r.id),
        settleDate,
      );

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('is-all-settled', () => {
      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
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
import { NAMESPACE_SCREEN, RECORD_LIST } from '../support/app.po';
import * as moment from 'moment';
import { BACKDOOR_ACTIONS, TestOwner } from '@angular-monorepo/backdoor';
import { ACTIONS } from '../support/actions';

const DATA_PROVIDER_URL = Cypress.env()['DATA_PROVIDER_URL'];

describe('Record list', () => {

  describe('date displaying',() => {
    const firstDate = moment().set({
      year: 2024,
      month: 2,
      date: 15,
    }).toDate();

    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    const secondDate = moment(firstDate)
      .subtract(2, 'hours').toDate();
    const thirdDate = moment(firstDate)
      .subtract(1, 'day').toDate();
    const fourthDate = moment(firstDate)
      .subtract(2, 'day').toDate();

    before(async () => {
      const scenario = await BACKDOOR_ACTIONS.SCENARIO.prepareNamespace(
        DATA_PROVIDER_URL,
        Cypress.env()['BACKDOOR_USERNAME'],
        Cypress.env()['BACKDOOR_PASSWORD'],
        'testnamespace',
        {  username: 'testuser'},
        [
          {  username: 'atestuser1'},
          {  username: 'btestuser2'},
          {  username: 'ctestuser3'},
        ],
        [
          {
            user: 'testuser',
            record: {
              benefitors: [
                'atestuser1',
                'btestuser2',
                'ctestuser3',
              ],
              cost: 4,
              currency: 'SIT',
              paidBy: ['testuser'],
              created: firstDate,
              edited: firstDate,
            },
          },
          {
            user: 'testuser',
            record: {
              benefitors: [
                'atestuser1',
                'btestuser2',
                'ctestuser3',
              ],
              cost: 10,
              currency: 'SIT',
              paidBy: ['testuser'],
              created: secondDate,
              edited: secondDate,
            },
          },
          {
            user: 'testuser',
            record: {
              benefitors: [
                'atestuser1',
                'btestuser2',
                'ctestuser3',
              ],
              cost: 5.4,
              currency: 'SIT',
              paidBy: ['testuser'],
              created: thirdDate,
              edited: thirdDate,
            },
          },
          {
            user: 'testuser',
            record: {
              benefitors: [
                'atestuser1',
                'btestuser2',
                'ctestuser3',
              ],
              cost: 3,
              currency: 'SIT',
              paidBy: ['testuser'],
              created: fourthDate,
              edited: fourthDate,
            },
          },
        ],
      );

      creatorOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('are ordered by date', () => {
      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      RECORD_LIST.DATE(0).hasDate(firstDate);
      RECORD_LIST.DATE(0).shouldHaveNumberOfRecords(2);
      RECORD_LIST.DATE(0).RECORD(0).shouldHaveCost('4');
      RECORD_LIST.DATE(0).RECORD(1).shouldHaveCost('10');
      RECORD_LIST.DATE(1).hasDate(thirdDate);
      RECORD_LIST.DATE(1).shouldHaveNumberOfRecords(1);
      RECORD_LIST.DATE(1).RECORD(0).shouldHaveCost('5.4');
      RECORD_LIST.DATE(2).hasDate(fourthDate);
      RECORD_LIST.DATE(2).shouldHaveNumberOfRecords(1);
      RECORD_LIST.DATE(2).RECORD(0).shouldHaveCost('3');
    });
  });

});
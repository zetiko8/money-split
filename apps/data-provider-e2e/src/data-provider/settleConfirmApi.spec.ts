import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke, testEnv, throwBeforeEachError } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { settleConfirmApi } from '@angular-monorepo/api-interface';
import { BACKDOOR_ACTIONS, TestOwner, TestScenarioNamespace } from '@angular-monorepo/backdoor';
import moment from 'moment';

const api = settleConfirmApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('basics', () => {
    const firstDate = moment().set({
      year: 2024,
      month: 2,
      date: 15,
    }).toDate();

    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;
    let ownerKeyOtherOwner!: string;
    const secondDate = moment(firstDate)
      .subtract(2, 'hours').toDate();
    const thirdDate = moment(firstDate)
      .subtract(1, 'day').toDate();
    const fourthDate = moment(firstDate)
      .subtract(2, 'day').toDate();

    beforeEach(async () => {
      try {
        scenario = await BACKDOOR_ACTIONS.SCENARIO.prepareNamespace(
          testEnv().DATA_PROVIDER_URL,
          testEnv().BACKDOOR_USERNAME,
          testEnv().BACKDOOR_PASSWORD,
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
        ownerKeyOtherOwner = (scenario.allUsers.find(u => u.owner.owner.id !== creatorOwner.owner.id)).owner.owner.key;
      } catch (error) {
        throwBeforeEachError(error);
      }
    });

    it('smoke', async () => {
      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}/settle/confirm/${scenario.creator.user.id}`,
        {}));
    });
    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}/settle/confirm/${scenario.creator.user.id}`,
          {},
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}/settle/confirm/${scenario.creator.user.id}`,
          {},
          {
            headers: {
              'Authorization': 'Bearer invalid',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
    it('throws 401 with invalid ownerKey', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKeyOtherOwner}/namespace/${namespaceId}/settle/confirm/${scenario.creator.user.id}`,
          {},
          creatorOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
    it.todo('throws 401 with namespace that does not belong to user');
    it.todo('throws 401 with user that does not belong to owner');
    it.todo('throws 401 with record that does not belong to namespace');
    it.todo('record doees not exist');
    it.todo('namespace does not exist',
      // async () => {
      //   await fnCall(API_NAME,
      //     async () => await axios.post(
      //       `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${20000000}/settle/confirm/${scenario.creator.user.id}`,
      //       {
      //         records: scenario.addedRecords.map(r => r.id),
      //       },
      //       creatorOwner.authHeaders(),
      //     ))
      //     .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
      // }
    );
    it('returns settlement object', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}/settle/confirm/${scenario.creator.user.id}`,
          {
            records: scenario.addedRecords.map(r => r.id),
          },
          creatorOwner.authHeaders()))
        .result((result => {
          expect(result).toEqual({
            id: expect.any(Number),
            created: expect.any(String),
            edited: expect.any(String),
            createdBy: scenario.creator.user.id,
            editedBy: scenario.creator.user.id,
            namespaceId: namespaceId,
          });
        }));
    });
  });
});

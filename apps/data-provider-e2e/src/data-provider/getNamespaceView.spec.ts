import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke, testEnv, throwBeforeEachError } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { getNamespaceViewApi } from '@angular-monorepo/api-interface';
import { BACKDOOR_ACTIONS, MockDataMachine, TestOwner, TestScenarioNamespace } from '@angular-monorepo/backdoor';
import moment from 'moment';

const api = getNamespaceViewApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('basics', () => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let otherOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;

    beforeEach(async () => {
      try {
        scenario = await BACKDOOR_ACTIONS.SCENARIO.prepareNamespace(
          testEnv().DATA_PROVIDER_URL,
          testEnv().BACKDOOR_USERNAME,
          testEnv().BACKDOOR_PASSWORD,
          'testnamespace',
          { username: 'testuser' },
          [],
          [],
        );

        creatorOwner = scenario.creator.owner;
        namespaceId = scenario.namespaceId;

        // Create other owner for validation tests
        await MockDataMachine.dispose(DATA_PROVIDER_URL, 'otherowner');
        otherOwner = await MockDataMachine.createNewOwnerAndLogHimIn(DATA_PROVIDER_URL, 'otherowner', 'testpassword');
      } catch (error) {
        throwBeforeEachError(error);
      }
    });

    it('smoke', async () => {
      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}`));
    });

    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}`,
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
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${otherOwner.owner.key}/namespace/${namespaceId}`,
          creatorOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('namespace does not exist', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/20000000`,
          creatorOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });

    it('returns a namespace view', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}`,
          creatorOwner.authHeaders(),
        ))
        .result((result => {
          expect(result).toEqual({
            id: namespaceId,
            name: 'testnamespace',
            invitations: [],
            users: [
              {
                id: expect.any(Number),
                name: 'testuser',
                namespaceId: namespaceId,
                ownerId: creatorOwner.owner.id,
                avatarId: expect.any(Number),
              },
            ],
            ownerUsers: [
              {
                id: expect.any(Number),
                name: 'testuser',
                namespaceId: namespaceId,
                ownerId: creatorOwner.owner.id,
                avatarId: expect.any(Number),
              },
            ],
            paymentEvents: [],
            avatarId: expect.any(Number),
            hasRecordsToSettle: false,
            settlements: [],
          });
        }));
    });
  });

  describe('payment event view', () => {
    const firstDate = moment().set({
      year: 2024,
      month: 2,
      date: 15,
    }).toDate();

    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;

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
          ],
        );

        creatorOwner = scenario.creator.owner;
        namespaceId = scenario.namespaceId;
      } catch (error) {
        throwBeforeEachError(error);
      }
    });

    it('verify payment event view data', async () => {

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}`,
          creatorOwner.authHeaders(),
        ))
        .result((result => {
          expect(result.paymentEvents).toHaveLength(1);
          expect(result.paymentEvents[0]).toEqual({
            id: expect.any(Number),
            benefitors: [
              {
                amount: expect.closeTo(1.33),
                currency: 'SIT',
                user: {
                  id: expect.any(Number),
                  name: 'atestuser1',
                  ownerId: expect.any(Number),
                  avatarId: expect.any(Number),
                  namespaceId: namespaceId,
                },
              },
              {
                amount: expect.closeTo(1.33),
                currency: 'SIT',
                user: {
                  id: expect.any(Number),
                  name: 'btestuser2',
                  ownerId: expect.any(Number),
                  avatarId: expect.any(Number),
                  namespaceId: namespaceId,
                },
              },
              {
                amount: expect.closeTo(1.33),
                currency: 'SIT',
                user: {
                  id: expect.any(Number),
                  name: 'ctestuser3',
                  ownerId: expect.any(Number),
                  avatarId: expect.any(Number),
                  namespaceId: namespaceId,
                },
              },
            ],
            created: expect.any(String),
            edited: expect.any(String),
            createdBy: {
              id: expect.any(Number),
              name: 'testuser',
              ownerId: expect.any(Number),
              avatarId: expect.any(Number),
              namespaceId: namespaceId,
            },
            editedBy: {
              id: expect.any(Number),
              name: 'testuser',
              ownerId: expect.any(Number),
              avatarId: expect.any(Number),
              namespaceId: namespaceId,
            },
            description: null,
            notes: null,
            namespaceId,
            paidBy: [
              {
                amount: 4,
                currency: 'SIT',
                user: {
                  id: expect.any(Number),
                  name: 'testuser',
                  ownerId: expect.any(Number),
                  avatarId: expect.any(Number),
                  namespaceId: namespaceId,
                },
              },
            ],
            settlementId: null,
            settledOn: null,
          });
        }));
    });
  });

  describe('payment events sorting by year', () => {
    const firstDate = moment().set({
      year: 2024,
      month: 2,
      date: 15,
    }).toDate();
    const secondDate = moment().set({
      year: 2025,
      month: 8,
      date: 17,
    }).toDate();

    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;

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
                cost: 5.4,
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
          ],
        );

        creatorOwner = scenario.creator.owner;
        namespaceId = scenario.namespaceId;
      } catch (error) {
        throwBeforeEachError(error);
      }
    });

    it('verify later year is before earlier year', async () => {

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}`,
          creatorOwner.authHeaders(),
        ))
        .result((result => {
          expect(result.paymentEvents).toHaveLength(2);
          expect(new Date(result.paymentEvents[0].created).getFullYear()).toBe(2025);
          expect(new Date(result.paymentEvents[1].created).getFullYear()).toBe(2024);
        }));
    });
  });

  describe('settled records', () => {
    const firstDate = moment().set({
      year: 2024,
      month: 2,
      date: 15,
    }).toDate();

    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;
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
      } catch (error) {
        throwBeforeEachError(error);
      }
    });

    it('verify unsettled view', async () => {

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}`,
          creatorOwner.authHeaders(),
        ))
        .result((result => {
          expect(result).toEqual({
            id: namespaceId,
            name: 'testnamespace',
            invitations: [],
            users: scenario.allUsers.map(u => ({
              id: u.user.id,
              name: u.user.name,
              namespaceId: namespaceId,
              ownerId: u.owner.owner.id,
              avatarId: expect.any(Number),
            })),
            ownerUsers: [
              {
                id: expect.any(Number),
                name: creatorOwner.owner.username,
                namespaceId: namespaceId,
                ownerId: creatorOwner.owner.id,
                avatarId: expect.any(Number),
              },
            ],
            avatarId: expect.any(Number),
            hasRecordsToSettle: true,
            settlements: [],
            paymentEvents: expect.any(Array),
          });

          expect(result.paymentEvents).toHaveLength(4);
        }));
    });

    it.todo('is settled');

    // it('is settled', async () => {

    //   try {
    //     await creatorOwner.settleRecords(namespaceId, scenario.creator.user.id,
    //       scenario.addedPaymentEvents.map(r => r.id), firstDate);
    //   } catch (error) {
    //     throwBeforeEachError(error);
    //   }

    //   await fnCall(API_NAME,
    //     async () => await axios.get(
    //       `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}`,
    //       creatorOwner.authHeaders(),
    //     ))
    //     .result((result => {
    //       const expected = anyExpect();
    //       expected.settlements = [
    //         {
    //           'isAllSettled': false,
    //           'settleRecords': expect.any(Array),
    //           'settledBy': {
    //             'avatarId': expect.any(Number),
    //             'id': scenario.creator.user.id,
    //             'name': scenario.creator.user.name,
    //             'namespaceId': namespaceId,
    //             'ownerId': scenario.creator.owner.owner.id,
    //           },
    //           'settlement': {
    //             'created': expect.any(String),
    //             'createdBy': scenario.creator.user.id,
    //             'edited': expect.any(String),
    //             'editedBy': scenario.creator.user.id,
    //             'id': expect.any(Number),
    //             'namespaceId': namespaceId,
    //           },
    //         },
    //       ];
    //       expected.hasRecordsToSettle = false;
    //       expect(result).toEqual(expected);
    //       expect(result.settlements).toHaveLength(1);
    //       expect(result.settlements[0].settleRecords).toHaveLength(3);
    //     }));
    // });

  });
});

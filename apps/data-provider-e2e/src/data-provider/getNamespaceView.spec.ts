import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { getNamespaceViewApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';
import moment from 'moment';

const api = getNamespaceViewApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('', 'smoke', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'testuser' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'testuser',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const creatorOwner = mockDataMachine.getOwner('testuser');

      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}`));
    });

  });

  describe('validation', () => {

    testWrap('', 'throws 401 with invalid token', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'testuser' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'testuser',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const creatorOwner = mockDataMachine.getOwner('testuser');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}`,
          {
            headers: {
              'Authorization': 'Bearer invalid',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'throws 401 with invalid ownerKey', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'testuser' },
            { name: 'otherowner' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'testuser',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const otherOwner = mockDataMachine.getOwner('otherowner');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${otherOwner.key}/namespace/${namespaceId}`,
          await mockDataMachine.getAuthHeaders('testuser'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('','namespace does not exist', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'testuser' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'testuser',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const creatorOwner = mockDataMachine.getOwner('testuser');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/20000000`,
          await mockDataMachine.getAuthHeaders('testuser'),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });

    testWrap('','returns a namespace view', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'testuser' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'testuser',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const creatorOwner = mockDataMachine.getOwner('testuser');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}`,
          await mockDataMachine.getAuthHeaders('testuser'),
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
                ownerId: creatorOwner.id,
                avatarId: expect.any(Number),
              },
            ],
            ownerUsers: [
              {
                id: expect.any(Number),
                name: 'testuser',
                namespaceId: namespaceId,
                ownerId: creatorOwner.id,
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

    testWrap('', 'verify namespace payment event data', async () => {

      const firstDate = moment().set({
        year: 2024,
        month: 2,
        date: 15,
      }).toDate();

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'testuser' },
            { name: 'atestuser1' },
            { name: 'btestuser2' },
            { name: 'ctestuser3' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'testuser',
              users: [
                { name: 'atestuser1' },
                { name: 'btestuser2' },
                { name: 'ctestuser3' },
              ],
              paymentEvents: [
                {
                  user: 'testuser',
                  data: {
                    benefitors: [
                      { user: 'atestuser1', amount: 4/3, currency: 'SIT' },
                      { user: 'btestuser2', amount: 4/3, currency: 'SIT' },
                      { user: 'ctestuser3', amount: 4/3, currency: 'SIT' },
                    ],
                    paidBy: [
                      { user: 'testuser', amount: 4, currency: 'SIT' },
                    ],
                    created: firstDate,
                    edited: firstDate,
                    description: null,
                    notes: null,
                  },
                },
              ],
            },
          ],
        },
      );

      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const creatorOwner = mockDataMachine.getOwner('testuser');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}`,
          await mockDataMachine.getAuthHeaders('testuser'),
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
            namespace: {
              id: namespaceId,
              avatarId: expect.any(Number),
              name: 'testnamespace',
            },
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
    testWrap('', 'verify later year is before earlier year', async () => {

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

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'testuser' },
            { name: 'atestuser1' },
            { name: 'btestuser2' },
            { name: 'ctestuser3' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'testuser',
              users: [
                { name: 'atestuser1' },
                { name: 'btestuser2' },
                { name: 'ctestuser3' },
              ],
              paymentEvents: [
                {
                  user: 'testuser',
                  data: {
                    benefitors: [
                      { user: 'atestuser1', amount: 5.4/3, currency: 'SIT' },
                      { user: 'btestuser2', amount: 5.4/3, currency: 'SIT' },
                      { user: 'ctestuser3', amount: 5.4/3, currency: 'SIT' },
                    ],
                    paidBy: [
                      { user: 'testuser', amount: 5.4, currency: 'SIT' },
                    ],
                    created: firstDate,
                    edited: firstDate,
                    description: null,
                    notes: null,
                  },
                },
                {
                  user: 'testuser',
                  data: {
                    benefitors: [
                      { user: 'atestuser1', amount: 10/3, currency: 'SIT' },
                      { user: 'btestuser2', amount: 10/3, currency: 'SIT' },
                      { user: 'ctestuser3', amount: 10/3, currency: 'SIT' },
                    ],
                    paidBy: [
                      { user: 'testuser', amount: 10, currency: 'SIT' },
                    ],
                    created: secondDate,
                    edited: secondDate,
                    description: null,
                    notes: null,
                  },
                },
              ],
            },
          ],
        },
      );

      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const creatorOwner = mockDataMachine.getOwner('testuser');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}`,
          await mockDataMachine.getAuthHeaders('testuser'),
        ))
        .result((result => {
          expect(result.paymentEvents).toHaveLength(2);
          expect(new Date(result.paymentEvents[0].created).getFullYear()).toBe(2025);
          expect(new Date(result.paymentEvents[1].created).getFullYear()).toBe(2024);
        }));
    });
  });

  describe('settled records', () => {
    testWrap('', 'verify unsettled view', async () => {

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
      const thirdDate = moment(firstDate)
        .subtract(1, 'day').toDate();
      const fourthDate = moment(firstDate)
        .subtract(2, 'day').toDate();


      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'testuser' },
            { name: 'atestuser1' },
            { name: 'btestuser2' },
            { name: 'ctestuser3' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'testuser',
              users: [
                { name: 'atestuser1' },
                { name: 'btestuser2' },
                { name: 'ctestuser3' },
              ],
              paymentEvents: [
                {
                  user: 'testuser',
                  data: {
                    benefitors: [
                      { user: 'atestuser1', amount: 4/3, currency: 'SIT' },
                      { user: 'btestuser2', amount: 4/3, currency: 'SIT' },
                      { user: 'ctestuser3', amount: 4/3, currency: 'SIT' },
                    ],
                    paidBy: [
                      { user: 'testuser', amount: 4, currency: 'SIT' },
                    ],
                    created: firstDate,
                    edited: firstDate,
                    description: null,
                    notes: null,
                  },
                },
                {
                  user: 'testuser',
                  data: {
                    benefitors: [
                      { user: 'atestuser1', amount: 10/3, currency: 'SIT' },
                      { user: 'btestuser2', amount: 10/3, currency: 'SIT' },
                      { user: 'ctestuser3', amount: 10/3, currency: 'SIT' },
                    ],
                    paidBy: [
                      { user: 'testuser', amount: 10, currency: 'SIT' },
                    ],
                    created: secondDate,
                    edited: secondDate,
                    description: null,
                    notes: null,
                  },
                },
                {
                  user: 'testuser',
                  data: {
                    benefitors: [
                      { user: 'atestuser1', amount: 5.4/3, currency: 'SIT' },
                      { user: 'btestuser2', amount: 5.4/3, currency: 'SIT' },
                      { user: 'ctestuser3', amount: 5.4/3, currency: 'SIT' },
                    ],
                    paidBy: [
                      { user: 'testuser', amount: 5.4, currency: 'SIT' },
                    ],
                    created: thirdDate,
                    edited: thirdDate,
                    description: null,
                    notes: null,
                  },
                },
                {
                  user: 'testuser',
                  data: {
                    benefitors: [
                      { user: 'atestuser1', amount: 3/3, currency: 'SIT' },
                      { user: 'btestuser2', amount: 3/3, currency: 'SIT' },
                      { user: 'ctestuser3', amount: 3/3, currency: 'SIT' },
                    ],
                    paidBy: [
                      { user: 'testuser', amount: 3, currency: 'SIT' },
                    ],
                    created: fourthDate,
                    edited: fourthDate,
                    description: null,
                    notes: null,
                  },
                },
              ],
            },
          ],
        },
      );

      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const allUsers = mockDataMachine.getNamespace('testnamespace').users;
      const creatorOwner = mockDataMachine.getOwner('testuser');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}`,
          await mockDataMachine.getAuthHeaders('testuser'),
        ))
        .result((result => {
          expect(result).toEqual({
            id: namespaceId,
            name: 'testnamespace',
            invitations: [],
            users: allUsers.map(u => ({
              id: u.id,
              name: u.name,
              namespaceId: namespaceId,
              ownerId: u.ownerId,
              avatarId: expect.any(Number),
            })),
            ownerUsers: [
              {
                id: expect.any(Number),
                name: creatorOwner.username,
                namespaceId: namespaceId,
                ownerId: creatorOwner.id,
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
    //       `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}`,
    //       await mockDataMachine.getAuthHeaders('testuser'),
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

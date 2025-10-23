import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { settlePreviewApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';
import { ERROR_CODE } from '@angular-monorepo/entities';

const api = settlePreviewApi();
const API_NAME = api.ajax.method + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('', 'smoke', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [
                { name: 'test@email.com', invitor: 'creator' },
              ],
              paymentEvents: [
                {
                  user: 'test@email.com',
                  data: {
                    paidBy: [{ user: 'test@email.com', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 50, currency: 'EUR' },
                      { user: 'test@email.com', amount: 50, currency: 'EUR' },
                    ],
                    description: 'test payment 1',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
                {
                  user: 'creator',
                  data: {
                    paidBy: [{ user: 'creator', amount: 60, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 30, currency: 'EUR' },
                      { user: 'test@email.com', amount: 30, currency: 'EUR' },
                    ],
                    description: 'test payment 2',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/settings`,
      ));
    });
  });

  describe('validation', () => {
    testWrap('', 'throws 401 with invalid token', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [
                { name: 'test@email.com', invitor: 'creator' },
              ],
              paymentEvents: [
                {
                  user: 'test@email.com',
                  data: {
                    paidBy: [{ user: 'test@email.com', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 50, currency: 'EUR' },
                      { user: 'test@email.com', amount: 50, currency: 'EUR' },
                    ],
                    description: 'test payment 1',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
                {
                  user: 'creator',
                  data: {
                    paidBy: [{ user: 'creator', amount: 60, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 30, currency: 'EUR' },
                      { user: 'test@email.com', amount: 30, currency: 'EUR' },
                    ],
                    description: 'test payment 2',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/settings`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/settings`,
          {
            headers: {
              Authorization: 'Bearer invalid-token',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'validates namespace exists', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [
                { name: 'test@email.com', invitor: 'creator' },
              ],
              paymentEvents: [
                {
                  user: 'test@email.com',
                  data: {
                    paidBy: [{ user: 'test@email.com', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 50, currency: 'EUR' },
                      { user: 'test@email.com', amount: 50, currency: 'EUR' },
                    ],
                    description: 'test payment 1',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
                {
                  user: 'creator',
                  data: {
                    paidBy: [{ user: 'creator', amount: 60, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 30, currency: 'EUR' },
                      { user: 'test@email.com', amount: 30, currency: 'EUR' },
                    ],
                    description: 'test payment 2',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/999999/settle/settings`,
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'validates user has access to namespace', async () => {

      // Create scenario with two namespaces - test user only has access to first one
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [
                { name: 'test@email.com', invitor: 'creator' },
              ],
              paymentEvents: [],
            },
            {
              name: 'other-namespace',
              creator: 'creator',
              users: [],  // test@email.com is NOT a member
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const otherNamespace = mockDataMachine.getNamespace('other-namespace');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${otherNamespace.id}/settle/settings`,
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'validates owner key exists', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [
                { name: 'test@email.com', invitor: 'creator' },
              ],
              paymentEvents: [
                {
                  user: 'test@email.com',
                  data: {
                    paidBy: [{ user: 'test@email.com', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 50, currency: 'EUR' },
                      { user: 'test@email.com', amount: 50, currency: 'EUR' },
                    ],
                    description: 'test payment 1',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
                {
                  user: 'creator',
                  data: {
                    paidBy: [{ user: 'creator', amount: 60, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 30, currency: 'EUR' },
                      { user: 'test@email.com', amount: 30, currency: 'EUR' },
                    ],
                    description: 'test payment 2',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const namespace = mockDataMachine.getNamespace('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/invalid-key/namespace/${namespace.id}/settle/settings`,
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns payment events to settle', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [
                { name: 'test@email.com', invitor: 'creator' },
              ],
              paymentEvents: [
                {
                  user: 'test@email.com',
                  data: {
                    paidBy: [{ user: 'test@email.com', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 50, currency: 'EUR' },
                      { user: 'test@email.com', amount: 50, currency: 'EUR' },
                    ],
                    description: 'test payment 1',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
                {
                  user: 'creator',
                  data: {
                    paidBy: [{ user: 'creator', amount: 60, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 30, currency: 'EUR' },
                      { user: 'test@email.com', amount: 30, currency: 'EUR' },
                    ],
                    description: 'test payment 2',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      const response = await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/settings`,
        await mockDataMachine.getAuthHeaders('test@email.com'),
      );

      expect(response.data.paymentEventsToSettle).toHaveLength(2);
      expect(response.data.paymentEventsToSettle[0]).toEqual({
        id: expect.any(Number),
        benefitors: [
          {
            amount: expect.closeTo(50),
            currency: 'EUR',
            user: {
              id: expect.any(Number),
              name: 'creator',
              ownerId: expect.any(Number),
              avatarId: expect.any(Number),
              namespaceId: namespace.id,
            },
          },
          {
            amount: expect.closeTo(50),
            currency: 'EUR',
            user: {
              id: expect.any(Number),
              name: 'test@email.com',
              ownerId: expect.any(Number),
              avatarId: expect.any(Number),
              namespaceId: namespace.id,
            },
          },
        ],
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: {
          id: expect.any(Number),
          name: 'test@email.com',
          ownerId: expect.any(Number),
          avatarId: expect.any(Number),
          namespaceId: namespace.id,
        },
        editedBy: {
          id: expect.any(Number),
          name: 'test@email.com',
          ownerId: expect.any(Number),
          avatarId: expect.any(Number),
          namespaceId: namespace.id,
        },
        description: 'test payment 1',
        notes: null,
        namespace: {
          id: namespace.id,
          avatarId: expect.any(Number),
          name: 'testnamespace',
        },
        namespaceId: namespace.id,
        paidBy: [
          {
            amount: 100,
            currency: 'EUR',
            user: {
              id: expect.any(Number),
              name: 'test@email.com',
              ownerId: expect.any(Number),
              avatarId: expect.any(Number),
              namespaceId: namespace.id,
            },
          },
        ],
        settlementId: null,
        settledOn: null,
      });
    });

    testWrap('', 'returns payment events to settle - number of payment events', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [
                { name: 'test@email.com', invitor: 'creator' },
              ],
              paymentEvents: [
                {
                  user: 'test@email.com',
                  data: {
                    paidBy: [{ user: 'test@email.com', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 50, currency: 'EUR' },
                      { user: 'test@email.com', amount: 50, currency: 'EUR' },
                    ],
                    description: 'test payment 1',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
                {
                  user: 'creator',
                  data: {
                    paidBy: [{ user: 'creator', amount: 60, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 30, currency: 'EUR' },
                      { user: 'test@email.com', amount: 30, currency: 'EUR' },
                    ],
                    description: 'test payment 2',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      const response = await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/settings`,
        await mockDataMachine.getAuthHeaders('test@email.com'),
      );

      expect(response.data.paymentEventsToSettle).toHaveLength(2);
    });

    testWrap('', 'returns payment events to settle - benefitors structure', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [
                { name: 'test@email.com', invitor: 'creator' },
              ],
              paymentEvents: [
                {
                  user: 'test@email.com',
                  data: {
                    paidBy: [{ user: 'test@email.com', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 50, currency: 'EUR' },
                      { user: 'test@email.com', amount: 50, currency: 'EUR' },
                    ],
                    description: 'test payment 1',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
                {
                  user: 'creator',
                  data: {
                    paidBy: [{ user: 'creator', amount: 60, currency: 'EUR' }],
                    benefitors: [
                      { user: 'creator', amount: 30, currency: 'EUR' },
                      { user: 'test@email.com', amount: 30, currency: 'EUR' },
                    ],
                    description: 'test payment 2',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      const response = await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/settings`,
        await mockDataMachine.getAuthHeaders('test@email.com'),
      );

      expect(response.data.paymentEventsToSettle[0].benefitors).toHaveLength(2);
      expect(response.data.paymentEventsToSettle[0].benefitors).toEqual([
        {
          amount: expect.closeTo(50),
          currency: 'EUR',
          user: {
            id: expect.any(Number),
            name: 'creator',
            ownerId: expect.any(Number),
            avatarId: expect.any(Number),
            namespaceId: namespace.id,
          },
        },
        {
          amount: expect.closeTo(50),
          currency: 'EUR',
          user: {
            id: expect.any(Number),
            name: 'test@email.com',
            ownerId: expect.any(Number),
            avatarId: expect.any(Number),
            namespaceId: namespace.id,
          },
        },
      ]);
    });

    it.todo('returns empty arrays when no unsettled payments exist');
  });
});
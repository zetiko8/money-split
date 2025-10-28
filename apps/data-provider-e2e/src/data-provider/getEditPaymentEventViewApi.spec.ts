import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { getEditPaymentEventViewApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';
import { ERROR_CODE } from '@angular-monorepo/entities';

const api = getEditPaymentEventViewApi();
const API_NAME = api.ajax.method + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('', 'smoke', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'namespace-owner1',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 3, currency: 'EUR' }],
                    benefitors: [{ user: 'creator-owner', amount: 3, currency: 'EUR' }],
                    description: 'test description',
                    notes: 'test notes',
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const paymentEventId = mockDataMachine.getNamespacePaymentEventIds('testnamespace')[0];

      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/payment-event/${paymentEventId}/edit`,
      ));
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
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'namespace-owner1',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 3, currency: 'EUR' }],
                    benefitors: [{ user: 'creator-owner', amount: 3, currency: 'EUR' }],
                    description: 'test description',
                    notes: 'test notes',
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const paymentEventId = mockDataMachine.getNamespacePaymentEventIds('testnamespace')[0];

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/payment-event/${paymentEventId}/edit`,
          {
            headers: {
              Authorization: 'Bearer invalid-token',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'throws 404 when payment event does not exist', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'namespace-owner1',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 3, currency: 'EUR' }],
                    benefitors: [{ user: 'creator-owner', amount: 3, currency: 'EUR' }],
                    description: 'test description',
                    notes: 'test notes',
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/payment-event/999999/edit`,
          await mockDataMachine.getAuthHeaders('namespace-owner1'),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });

    testWrap('', 'throws 404 when namespace does not exist', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'namespace-owner1',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 3, currency: 'EUR' }],
                    benefitors: [{ user: 'creator-owner', amount: 3, currency: 'EUR' }],
                    description: 'test description',
                    notes: 'test notes',
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const paymentEventId = mockDataMachine.getNamespacePaymentEventIds('testnamespace')[0];

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/999999/payment-event/${paymentEventId}/edit`,
          await mockDataMachine.getAuthHeaders('namespace-owner1'),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });

    testWrap('', 'throws 403 when user is not a member of the namespace', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'other-owner' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'namespace-owner1',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 3, currency: 'EUR' }],
                    benefitors: [{ user: 'creator-owner', amount: 3, currency: 'EUR' }],
                    description: 'test description',
                    notes: 'test notes',
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const paymentEventId = mockDataMachine.getNamespacePaymentEventIds('testnamespace')[0];

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/payment-event/${paymentEventId}/edit`,
          await mockDataMachine.getAuthHeaders('other-owner'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns namespace and payment event data', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'namespace-owner1',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 3, currency: 'EUR' }],
                    benefitors: [{ user: 'creator-owner', amount: 3, currency: 'EUR' }],
                    description: 'test description',
                    notes: 'test notes',
                    created: new Date(),
                    edited: new Date(),
                  },
                },
              ],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const paymentEventId = mockDataMachine.getNamespacePaymentEventIds('testnamespace')[0];
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/payment-event/${paymentEventId}/edit`,
          await mockDataMachine.getAuthHeaders('namespace-owner1'),
        ),
      ).result((response) => {
        expect(response).toEqual({
          namespace: {
            id: namespaceId,
            invitations: expect.any(Array),
            users: expect.any(Array),
            ownerUsers: expect.any(Array),
            paymentEvents: expect.any(Array),
            hasRecordsToSettle: expect.any(Boolean),
            settlements: expect.any(Array),
            avatarId: expect.any(Number),
            name: 'testnamespace',
          },
          paymentEvent: {
            id: paymentEventId,
            created: expect.any(String),
            edited: expect.any(String),
            createdBy: userId,
            editedBy: userId,
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            namespaceId,
            settlementId: null,
            description: 'test description',
            notes: 'test notes',
          },
        });
      });
    });
  });

});

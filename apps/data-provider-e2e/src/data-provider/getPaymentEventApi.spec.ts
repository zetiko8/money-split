import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { getPaymentEventApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';
import { ERROR_CODE, PaymentEvent } from '@angular-monorepo/entities';

const api = getPaymentEventApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

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
            name: 'namespace1',
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
    const namespaceId = mockDataMachine.getNamespace('namespace1').id;
    const paymentEventId = mockDataMachine.getNamespacePaymentEventIds('namespace1')[0];

    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/payment-event/${paymentEventId}`,
    ));
  });

  describe('validation', () => {
    testWrap('', 'returns 404 when payment event does not exist', async () => {
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
              name: 'namespace1',
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
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/payment-event/999999`,
          await mockDataMachine.getAuthHeaders('namespace-owner1'),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });

    testWrap('', 'returns 404 when namespace does not exist', async () => {
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
              name: 'namespace1',
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
      const paymentEventId = mockDataMachine.getNamespacePaymentEventIds('namespace1')[0];

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/999999/payment-event/${paymentEventId}`,
          await mockDataMachine.getAuthHeaders('namespace-owner1'),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });

    testWrap('', 'returns 401 with missing token', async () => {
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
              name: 'namespace1',
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
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const paymentEventId = mockDataMachine.getNamespacePaymentEventIds('namespace1')[0];

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/payment-event/${paymentEventId}`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'returns 401 with invalid token', async () => {
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
              name: 'namespace1',
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
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const paymentEventId = mockDataMachine.getNamespacePaymentEventIds('namespace1')[0];

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/payment-event/${paymentEventId}`,
          {
            headers: {
              Authorization: 'Bearer invalid-token',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns payment event', async () => {
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
              name: 'namespace1',
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
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const paymentEventId = mockDataMachine.getNamespacePaymentEventIds('namespace1')[0];
      const userId = mockDataMachine.getNamespaceUser('namespace1', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/payment-event/${paymentEventId}`,
          await mockDataMachine.getAuthHeaders('namespace-owner1'),
        ),
      ).result((response: PaymentEvent) => {
        expect(response).toEqual({
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
        });
      });
    });
  });
});

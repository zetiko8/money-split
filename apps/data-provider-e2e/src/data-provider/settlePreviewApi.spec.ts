import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { settlePreviewApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';
import { ERROR_CODE } from '@angular-monorepo/entities';

const api = settlePreviewApi();
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
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
        {
          separatedSettlementPerCurrency: true,
          currencies: { 'EUR': 1 },
          mainCurrency: 'EUR',
          paymentEvents: paymentEventIds,
        },
        await mockDataMachine.getAuthHeaders('test@email.com'),
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
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
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
        DATA_MOCKER_URL,
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
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/999999/settle/preview`,
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'validates user has access to namespace', async () => {

      // Create scenario with two namespaces - test user only has access to first one
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${otherNamespace.id}/settle/preview`,
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'validates owner key exists', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invalid-key/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'validates payload with missing fields', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {},
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates payload with missing currencies field', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
              ],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const namespace = mockDataMachine.getNamespace('testnamespace');
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates payload with missing mainCurrency field', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
              ],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const namespace = mockDataMachine.getNamespace('testnamespace');
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            paymentEvents: paymentEventIds,
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates negative currency value', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': -1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates invalid currency code', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'INVALID': 1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates invalid main currency', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'INVALID',
            paymentEvents: paymentEventIds,
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates invalid separatedSettlementPerCurrency type', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: 'not-a-boolean',
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates invalid currencies type', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: 'not-an-object',
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates invalid currency value type', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 'not-a-number' },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates empty paymentEvents array', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [],
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates payment event from different namespace', async () => {

      // Create scenario with two namespaces, each with payment events
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
              ],
            },
            {
              name: 'other-namespace',
              creator: 'creator',
              users: [],
              paymentEvents: [
                {
                  user: 'creator',
                  data: {
                    paidBy: [{ user: 'creator', amount: 60, currency: 'EUR' }],
                    benefitors: [{ user: 'creator', amount: 60, currency: 'EUR' }],
                    description: 'test payment in other namespace',
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
      const otherNamespacePaymentEventIds = mockDataMachine.getNamespacePaymentEventIds('other-namespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: otherNamespacePaymentEventIds,
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates invalid payment event ID', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [999999],
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates invalid paymentEvents type', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('test@email.com');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: 'not-an-array',
          },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns correct settlement preview structure', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
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
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('testnamespace');

      const response = await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settle/preview`,
        {
          separatedSettlementPerCurrency: true,
          currencies: { 'EUR': 1 },
          mainCurrency: 'EUR',
          paymentEvents: paymentEventIds,
        },
        await mockDataMachine.getAuthHeaders('test@email.com'),
      );

      expect(response.data.settleRecords).toHaveLength(1);
      expect(response.data.settleRecords[0].settled).toBe(false);
      expect(response.data.settleRecords[0].settledBy).toBe(null);
      expect(response.data.settleRecords[0].settledOn).toBe(null);
      expect(response.data.settleRecords[0].data.benefitors[0]).toEqual(      {
        id: expect.any(Number),
        namespaceId: expect.any(Number),
        name: 'creator',
        ownerId: expect.any(Number),
        avatarId: expect.any(Number),
      });
      expect(response.data.settleRecords[0].data.paidBy[0]).toEqual({
        id: expect.any(Number),
        namespaceId: expect.any(Number),
        name: 'test@email.com',
        ownerId: expect.any(Number),
        avatarId: expect.any(Number),
      });
      expect(response.data.settleRecords[0].data.cost).toBe(20);
      expect(response.data.settleRecords[0].data.currency).toBe('EUR');
    });

    it.todo('returns empty arrays when no unsettled payments exist');
    it.todo('multiple currencies');
  });
});
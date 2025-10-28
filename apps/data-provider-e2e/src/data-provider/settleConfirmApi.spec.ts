import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, queryDb, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { settleConfirmApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';

const api = settleConfirmApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {


  testWrap('','smoke', async () => {

    const mockDataMachine = await MockDataMachine2.createScenario(
      DATA_MOCKER_URL,
      BACKDOOR_USERNAME,
      BACKDOOR_PASSWORD,
      {
        owners: [
          { name: 'creator-owner' },
        ],
        namespaces: [
          {
            name: 'namespace1',
            creator: 'creator-owner',
            users: [],
            paymentEvents: [],
          },
        ],
      },
    );

    const creatorOwner = mockDataMachine.getOwner('creator-owner');
    const namespaceId = mockDataMachine.getNamespace('namespace1').id;
    const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
      {}));
  });

  describe('validation', () => {
    testWrap('','throws 401 with invalid token', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
          },
          {
            headers: {
              'Authorization': 'Bearer invalid',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
    testWrap('','throws 401 with invalid ownerKey', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
            { name: 'other-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const otherOwner = mockDataMachine.getOwner('other-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${otherOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {},
          await mockDataMachine.getAuthHeaders('creator-owner'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
    testWrap('', 'validates required fields in payload', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      // Missing all fields
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {},
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);

      // Missing mainCurrency
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates currency values', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': -1 },
            mainCurrency: 'EUR',
            paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'INVALID': 1 },
            mainCurrency: 'EUR',
            paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates separatedSettlementPerCurrency type', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;
      const paymentEventIds = mockDataMachine.getNamespacePaymentEventIds('namespace1');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: 'not-a-boolean',
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates empty payment events array', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [],
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates invalid payment event IDs', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [999999],
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates payment events from different namespace', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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
              name: 'namespace2',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [mockDataMachine.getNamespacePaymentEventIds('namespace2')],
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });


    testWrap('', 'throws 401 with user that does not belong to owner', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const otherUserId = mockDataMachine.getNamespaceUser('namespace1', 'namespace-owner1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${otherUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [mockDataMachine.getNamespacePaymentEventIds('namespace1')],
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'throws 404 when record does not exist', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [999999],
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
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
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/999999/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns settlement object', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const response = await axios.post(
        `${DATA_PROVIDER_URL}/app/${mockDataMachine.getOwner('creator-owner').key}/namespace/${mockDataMachine.getNamespace('namespace1').id}/settle/confirm/${mockDataMachine.getNamespaceUser('namespace1', 'namespace-owner1').id}`,
        {
          separatedSettlementPerCurrency: true,
          currencies: { 'EUR': 1 },
          mainCurrency: 'EUR',
          paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
        },
        await mockDataMachine.getAuthHeaders('creator-owner'));

      expect(response.data).toEqual({
        id: expect.any(Number),
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: mockDataMachine.getNamespaceUser('namespace1', 'namespace-owner1').id,
        editedBy: mockDataMachine.getNamespaceUser('namespace1', 'namespace-owner1').id,
        namespaceId: mockDataMachine.getNamespace('namespace1').id,
      });

    });
  });

  describe('dbState', () => {
    testWrap('', 'saves SettlementDebts into db', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;
      const namespaceOwner1Id = mockDataMachine.getNamespaceUser('namespace1', 'namespace-owner1').id;

      const settleConfirmResponse = await axios.post(
        `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
        {
          separatedSettlementPerCurrency: true,
          currencies: { 'EUR': 1 },
          mainCurrency: 'EUR',
          paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
        },
        await mockDataMachine.getAuthHeaders('creator-owner'));

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM \`SettlementDebt\`
        WHERE settlementId = ${settleConfirmResponse.data.id}
        `,
      );
      (response as { data: string }[]).forEach(item => {
        expect(item).toEqual({
          id: expect.any(Number),
          created: expect.any(String),
          edited: expect.any(String),
          createdBy: creatorUserId,
          editedBy: creatorUserId,
          data: expect.any(String),
          namespaceId: namespaceId,
          settlementId: settleConfirmResponse.data.id,
          settled: 0,
          settledOn: null,
          settledBy: null,
        });
        expect(JSON.parse(item.data)).toEqual({
          'benefitors': [expect.any(Number)],
          'cost': expect.any(Number),
          'currency':'EUR',
          'paidBy':[namespaceOwner1Id],
        });
        expect(JSON.parse(item.data).cost)
          .toBeCloseTo(50);
      });
      expect(response).toHaveLength(1);
    });
  });

  describe('settlement settings', () => {
    testWrap('', 'two currencies, two events, separatedSettlementPerCurrency = true', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
                    ],
                    description: 'test payment 1',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'SIT' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'SIT' },
                      { user: 'namespace-owner1', amount: 50, currency: 'SIT' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      const settleConfirmResponse = await axios.post(
        `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
        {
          separatedSettlementPerCurrency: true,
          currencies: { 'EUR': 1 },
          mainCurrency: 'EUR',
          paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
        },
        await mockDataMachine.getAuthHeaders('creator-owner'));

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM \`SettlementDebt\`
        WHERE settlementId = ${settleConfirmResponse.data.id}
        `,
      );

      expect(response).toHaveLength(2);

      expect(JSON.parse((response as { data: string }[])[0].data)).toEqual({
        'benefitors': [expect.any(Number)],
        'cost': expect.closeTo(50),
        'currency':'EUR',
        'paidBy':[expect.any(Number)],
      });
      expect(JSON.parse((response as { data: string }[])[1].data)).toEqual({
        'benefitors': [expect.any(Number)],
        'cost': expect.closeTo(50),
        'currency':'SIT',
        'paidBy':[expect.any(Number)],
      });
    });
    testWrap('', 'two currencies, one event, separatedSettlementPerCurrency = true', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [
                      { user: 'namespace-owner1', amount: 100, currency: 'EUR' },
                      { user: 'creator-owner', amount: 5, currency: 'SIT' },
                    ],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 5, currency: 'SIT' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      const settleConfirmResponse = await axios.post(
        `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
        {
          separatedSettlementPerCurrency: true,
          currencies: { 'EUR': 1 },
          mainCurrency: 'EUR',
          paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
        },
        await mockDataMachine.getAuthHeaders('creator-owner'));

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM \`SettlementDebt\`
        WHERE settlementId = ${settleConfirmResponse.data.id}
        `,
      );

      expect(response).toHaveLength(2);

      expect(JSON.parse((response as { data: string }[])[0].data)).toEqual({
        'benefitors': [expect.any(Number)],
        'cost': expect.closeTo(50),
        'currency':'EUR',
        'paidBy':[expect.any(Number)],
      });
      expect(JSON.parse((response as { data: string }[])[1].data)).toEqual({
        'benefitors': [expect.any(Number)],
        'cost': expect.closeTo(5),
        'currency':'SIT',
        'paidBy':[expect.any(Number)],
      });
    });
    testWrap('', 'two currencies, two events, separatedSettlementPerCurrency = false', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
                    ],
                    description: 'test payment 1',
                    notes: null,
                    created: new Date(),
                    edited: new Date(),
                  },
                },
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'SIT' }],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'SIT' },
                      { user: 'namespace-owner1', amount: 50, currency: 'SIT' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      const settleConfirmResponse = await axios.post(
        `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
        {
          separatedSettlementPerCurrency: false,
          currencies: { 'EUR': 1, 'SIT': 2 },
          mainCurrency: 'EUR',
          paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
        },
        await mockDataMachine.getAuthHeaders('creator-owner'));

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM \`SettlementDebt\`
        WHERE settlementId = ${settleConfirmResponse.data.id}
        `,
      );

      expect(response).toHaveLength(1);

      expect(JSON.parse((response as { data: string }[])[0].data)).toEqual({
        'benefitors': [expect.any(Number)],
        'cost': expect.closeTo(150),
        'currency':'EUR',
        'paidBy':[expect.any(Number)],
      });
    });
    testWrap('', 'two currencies, one event, separatedSettlementPerCurrency = false', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
            { name: 'namespace-owner2' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [
                {
                  user: 'creator-owner',
                  data: {
                    paidBy: [
                      { user: 'namespace-owner1', amount: 100, currency: 'EUR' },
                      { user: 'creator-owner', amount: 5, currency: 'SIT' },
                    ],
                    benefitors: [
                      { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
                      { user: 'namespace-owner1', amount: 5, currency: 'SIT' },
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

      const creatorOwner = mockDataMachine.getOwner('creator-owner');
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('namespace1', 'creator-owner').id;

      const settleConfirmResponse = await axios.post(
        `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
        {
          separatedSettlementPerCurrency: false,
          currencies: { 'EUR': 1, 'SIT': 2 },
          mainCurrency: 'EUR',
          paymentEvents: mockDataMachine.getNamespacePaymentEventIds('namespace1'),
        },
        await mockDataMachine.getAuthHeaders('creator-owner'));

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM \`SettlementDebt\`
        WHERE settlementId = ${settleConfirmResponse.data.id}
        `,
      );

      expect(response).toHaveLength(2);

      expect(JSON.parse((response as { data: string }[])[0].data)).toEqual({
        'benefitors': [expect.any(Number)],
        'cost': expect.closeTo(10),
        'currency':'EUR',
        'paidBy':[expect.any(Number)],
      });
      expect(JSON.parse((response as { data: string }[])[1].data)).toEqual({
        'benefitors': [expect.any(Number)],
        'cost': expect.closeTo(40),
        'currency':'EUR',
        'paidBy':[expect.any(Number)],
      });
    });
  });
});

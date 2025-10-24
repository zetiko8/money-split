import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_PROVIDER_URL, fnCall, queryDb, smoke, testWrap } from '../test-helpers';
import { addPaymentEventApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';
import { ERROR_CODE, PaymentEvent } from '@angular-monorepo/entities';

const api = addPaymentEventApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('', 'smoke', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;

      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
      ));
    });
  });

  describe('validation', () => {

    testWrap('', 'requires paidBy to be provided', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            // paidBy is missing (being tested)
            benefitors: [{ userId: creatorUserId, amount: 3 }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates userId is a non-negative bigint in paidBy nodes - string value', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId: 'invalid', amount: 3, currency: 'EUR' }], // being tested - invalid userId type
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates userId is a non-negative bigint in paidBy nodes - float value', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId: 1.5, amount: 3, currency: 'EUR' }], // being tested - float userId
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates userId is a non-negative bigint in paidBy nodes - negative value', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId: -1, amount: 3, currency: 'EUR' }], // being tested - negative userId
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates amount is a number in paidBy nodes', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 'invalid', currency: 'EUR' }], // being tested - invalid amount type
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates currency in paidBy nodes', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'invalid' }], // being tested - invalid currency
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'requires benefitors to be provided', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            // benefitors is missing (being tested)
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates userId is a non-negative bigint in benefitors nodes - string value', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: 'invalid', amount: 3, currency: 'EUR' }], // being tested - invalid userId type
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates userId is a non-negative bigint in benefitors nodes - float value', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: 1.5, amount: 3, currency: 'EUR' }], // being tested - float userId
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates userId is a non-negative bigint in benefitors nodes - negative value', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: -1, amount: 3, currency: 'EUR' }], // being tested - negative userId
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates amount is a number in benefitors nodes', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 'invalid', currency: 'EUR' }], // being tested - invalid amount type
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates currency in benefitors nodes', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'invalid' }], // being tested - invalid currency
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    // TODO: Add validation in router.ts that users exist in the namespace
    it.todo('validates that users in paidBy and benefitors arrays exist in the namespace');

    testWrap('', 'requires paidBy array to not be empty', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [], // being tested
            benefitors: [{ userId: creatorUserId, amount: 3 }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'requires benefitors array to not be empty', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [], // being tested
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'requires paidBy nodes to have userId', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ amount: 3, currency: 'EUR' }], // being tested - missing userId
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'requires paidBy nodes to have amount', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId }], // being tested - missing amount
            benefitors: [{ userId: creatorUserId, amount: 3 }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'requires benefitor nodes to have userId', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ amount: 3, currency: 'EUR' }], // being tested - missing userId
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'requires benefitor nodes to have amount', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId }], // being tested - missing amount
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates description is a string when provided', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 123, // being tested - invalid type
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates notes is a string when provided', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 123, // being tested - invalid type
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'invalid namespaceId', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${999}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'invalid userId', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${999}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    // TODO: Add validation in router.ts that creator belongs to current owner
    it.todo('validates that the creator belongs to the current owner');

    testWrap('', 'throws 401 with invalid token', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          {
            headers: {
              Authorization: 'Bearer invalid-token',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
  });

  describe('complex payment event validation', () => {
    describe('amount owed must be same as amount paid', () => {
      testWrap('', 'multiple payers must equal benefitors - 2EUR + 3EUR != 4EUR', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;
        const anotherUserId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner2').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [
                { userId, amount: 2, currency: 'EUR' },
                { userId: creatorUserId, amount: 3, currency: 'EUR' },
              ],
              benefitors: [{ userId: anotherUserId, amount: 4, currency: 'EUR' }],
              description: 'test description',
              notes: 'test notes',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });

      testWrap('', 'multiple benefitors must equal payers - 5EUR != 2EUR + 2EUR', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;
        const anotherUserId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner2').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 5, currency: 'EUR' }],
              benefitors: [
                { userId: creatorUserId, amount: 2, currency: 'EUR' },
                { userId: anotherUserId, amount: 2, currency: 'EUR' },
              ],
              description: 'test description',
              notes: 'test notes',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });

      testWrap('', 'amounts must be positive - negative payer amount', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: -3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
              description: 'test description',
              notes: 'test notes',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });

      testWrap('', 'amounts must be positive - negative benefitor amount', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: -3, currency: 'EUR' }],
              description: 'test description',
              notes: 'test notes',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });
      testWrap('', '3 EUR != 4 EUR', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 4, currency: 'EUR' }],
              description: 'a',
              notes: 'a',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });
      testWrap('', '3 EUR == 3 EUR', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
              description: 'a',
              notes: 'a',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .toBe200();
      });

      testWrap('', '3 EUR != 4 USD', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 4, currency: 'USD' }],
              description: 'a',
              notes: 'a',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });

      testWrap('', '4 USD == 4 USD', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 4, currency: 'USD' }],
              benefitors: [{ userId: creatorUserId, amount: 4, currency: 'USD' }],
              description: 'a',
              notes: 'a',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .toBe200();
      });

      testWrap('', '3 EUR + 3 EUR != 4 EUR', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }, { userId: creatorUserId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 4, currency: 'EUR' }],
              description: 'a',
              notes: 'a',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });

      testWrap('.only', '3 EUR + 3 EUR == 6 EUR', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }, { userId: creatorUserId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 6, currency: 'EUR' }],
              description: 'a',
              notes: 'a',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .toBe200();
      });

      testWrap('.only', 'allows multiple currencies if sums match - EUR and USD', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;
        const anotherUserId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner2').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [
                { userId, amount: 10, currency: 'EUR' },
                { userId: creatorUserId, amount: 20, currency: 'USD' },
              ],
              benefitors: [
                { userId: creatorUserId, amount: 10, currency: 'EUR' },
                { userId: anotherUserId, amount: 20, currency: 'USD' },
              ],
              description: 'a',
              notes: 'a',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .toBe200();
      });

      testWrap('.only', 'fails if any currency sum does not match - EUR matches but USD does not', async () => {
        const mockDataMachine = await MockDataMachine2.createScenario(
          DATA_PROVIDER_URL,
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
                name: 'testnamespace',
                creator: 'creator-owner',
                users: [
                  { name: 'namespace-owner1', invitor: 'creator-owner' },
                  { name: 'namespace-owner2', invitor: 'creator-owner' },
                ],
                paymentEvents: [],
              },
            ],
          },
        );

        const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
        const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
        const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
        const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;
        const anotherUserId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner2').id;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [
                { userId, amount: 10, currency: 'EUR' },
                { userId: creatorUserId, amount: 20, currency: 'USD' },
              ],
              benefitors: [
                { userId: creatorUserId, amount: 10, currency: 'EUR' },
                { userId: anotherUserId, amount: 25, currency: 'USD' },
              ],
              description: 'a',
              notes: 'a',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1')))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns a payment event', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          await mockDataMachine.getAuthHeaders('namespace-owner1')),
      ).result((response: PaymentEvent) => {
        expect(response).toEqual({
          id: expect.any(Number),
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

  describe('dbState', () => {
    testWrap('', 'saves payment event in the db', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      let paymentEventId!: number;
      await fnCall(
        API_NAME,
        async () =>
          await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
              description: 'test description',
              notes: 'test notes',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1'),
          ),
      ).result(async (res: PaymentEvent) => {
        paymentEventId = res.id;
      });

      interface PaymentEventDbRow {
        id: number;
        created: Date;
        edited: Date;
        createdBy: number;
        editedBy: number;
        namespaceId: number;
        settlementId: number | null;
        description: string | null;
        notes: string | null;
      }

      const response = (await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `SELECT * FROM PaymentEvent WHERE id = ${paymentEventId}`,
      )) as PaymentEventDbRow[];

      const dbRow = response[0];
      const parsedRow = {
        ...dbRow,
      };

      expect(parsedRow).toEqual({
        id: paymentEventId,
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: userId,
        editedBy: userId,
        namespaceId,
        settlementId: null,
        description: 'test description',
        notes: 'test notes',
      });
      expect(response).toHaveLength(1);
    });

    it('saves payment nodes in the db', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              name: 'testnamespace',
              creator: 'creator-owner',
              users: [
                { name: 'namespace-owner1', invitor: 'creator-owner' },
                { name: 'namespace-owner2', invitor: 'creator-owner' },
              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('testnamespace').id;
      const userId = mockDataMachine.getNamespaceUser('testnamespace', 'namespace-owner1').id;
      const creatorUserId = mockDataMachine.getNamespaceUser('testnamespace', 'creator-owner').id;

      let paymentEventId!: number;
      await fnCall(
        API_NAME,
        async () =>
          await axios.post(
            `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
              description: 'test description',
              notes: 'test notes',
            },
            await mockDataMachine.getAuthHeaders('namespace-owner1'),
          ),
      ).result(async (res: PaymentEvent) => {
        paymentEventId = res.id;
      });

      interface PaymentNodeDbRow {
        id: number;
        paymentEventId: number;
        userId: number;
        amount: string;
        currency: string;
        type: string;
      }

      const response = (await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `SELECT * FROM PaymentNode WHERE paymentEventId = ${paymentEventId} ORDER BY type DESC, id ASC`,
      )) as PaymentNodeDbRow[];

      expect(response).toHaveLength(2);

      // First should be paidBy (type 'P')
      expect(response[0]).toEqual({
        id: expect.any(Number),
        paymentEventId,
        userId,
        amount: '3.00',
        currency: 'EUR',
        type: 'P',
      });

      // Second should be benefitor (type 'B')
      expect(response[1]).toEqual({
        id: expect.any(Number),
        paymentEventId,
        userId: creatorUserId,
        amount: '3.00',
        currency: 'EUR',
        type: 'B',
      });
    });
  });
});

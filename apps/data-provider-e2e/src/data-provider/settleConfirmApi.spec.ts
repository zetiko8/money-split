import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_PROVIDER_URL, fnCall, queryDb, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { settleConfirmApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';

const api = settleConfirmApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {


  testWrap('','smoke', async () => {
    const machine = new MockDataMachine2(
      DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

    await machine.createOwner('creator-owner');
    await machine.createNamespace('creator-owner', 'namespace1');

    const creatorOwner = machine.getOwner('creator-owner');
    const namespaceId = machine.getNamespace('namespace1').id;
    const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;

    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
      {}));
  });

  describe('validation', () => {
    testWrap('','throws 401 with invalid token', async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const creatorOwner = machine.getOwner('creator-owner');
      const namespaceId = machine.getNamespace('namespace1').id;
      const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: machine.getNamespacePaymentEventIds('namespace1'),
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
            paymentEvents: machine.getNamespacePaymentEventIds('namespace1'),
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
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');
      await machine.createOwner('other-owner');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const otherOwner = machine.getOwner('other-owner');
      const namespaceId = machine.getNamespace('namespace1').id;
      const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${otherOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {},
          await machine.getAuthHeaders('creator-owner'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
    testWrap('', 'validates required fields in payload', async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const creatorOwner = machine.getOwner('creator-owner');
      const namespaceId = machine.getNamespace('namespace1').id;
      const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;

      // Missing all fields
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {},
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);

      // Missing mainCurrency
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            paymentEvents: machine.getNamespacePaymentEventIds('namespace1'),
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates currency values', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const creatorOwner = machine.getOwner('creator-owner');
      const namespaceId = machine.getNamespace('namespace1').id;
      const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': -1 },
            mainCurrency: 'EUR',
            paymentEvents: machine.getNamespacePaymentEventIds('namespace1'),
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'INVALID': 1 },
            mainCurrency: 'EUR',
            paymentEvents: machine.getNamespacePaymentEventIds('namespace1'),
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates separatedSettlementPerCurrency type', async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const creatorOwner = machine.getOwner('creator-owner');
      const namespaceId = machine.getNamespace('namespace1').id;
      const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;
      const paymentEventIds = machine.getNamespacePaymentEventIds('namespace1');
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: 'not-a-boolean',
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates empty payment events array', async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const creatorOwner = machine.getOwner('creator-owner');
      const namespaceId = machine.getNamespace('namespace1').id;
      const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [],
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates invalid payment event IDs', async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const creatorOwner = machine.getOwner('creator-owner');
      const namespaceId = machine.getNamespace('namespace1').id;
      const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [999999],
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'validates payment events from different namespace', async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.createNamespace('creator-owner', 'namespace2');
      await machine.inviteToNamespace('creator-owner', 'namespace2', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace2', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');
      await machine.acceptInvitation('namespace-owner1', 'namespace2', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace2', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });
      await machine.addPaymentEvent('creator-owner', 'namespace2', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const creatorOwner = machine.getOwner('creator-owner');
      const namespaceId = machine.getNamespace('namespace1').id;
      const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [machine.getNamespacePaymentEventIds('namespace2')],
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });


    testWrap('', 'throws 401 with user that does not belong to owner', async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const creatorOwner = machine.getOwner('creator-owner');
      const namespaceId = machine.getNamespace('namespace1').id;
      const otherUserId = machine.getNamespaceUser('namespace1', 'namespace-owner1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${otherUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [machine.getNamespacePaymentEventIds('namespace1')],
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'throws 404 when record does not exist', async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const creatorOwner = machine.getOwner('creator-owner');
      const namespaceId = machine.getNamespace('namespace1').id;
      const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [999999],
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'throws 404 when namespace does not exist', async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const creatorOwner = machine.getOwner('creator-owner');
      const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/999999/settle/confirm/${creatorUserId}`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: machine.getNamespacePaymentEventIds('namespace1'),
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns settlement object', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const response = await axios.post(
        `${DATA_PROVIDER_URL}/app/${machine.getOwner('creator-owner').key}/namespace/${machine.getNamespace('namespace1').id}/settle/confirm/${machine.getNamespaceUser('namespace1', 'namespace-owner1').id}`,
        {
          separatedSettlementPerCurrency: true,
          currencies: { 'EUR': 1 },
          mainCurrency: 'EUR',
          paymentEvents: machine.getNamespacePaymentEventIds('namespace1'),
        },
        await machine.getAuthHeaders('creator-owner'));

      expect(response.data).toEqual({
        id: expect.any(Number),
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: machine.getNamespaceUser('namespace1', 'namespace-owner1').id,
        editedBy: machine.getNamespaceUser('namespace1', 'namespace-owner1').id,
        namespaceId: machine.getNamespace('namespace1').id,
      });

    });
  });

  describe('dbState', () => {
    testWrap('', 'saves SettlementDebts into db', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner1@test.com');
      await machine.inviteToNamespace('creator-owner', 'namespace1', 'namespace-owner2@test.com');

      await machine.acceptInvitation('namespace-owner1', 'namespace1', 'namespace-owner1@test.com', 'namespace-owner1');
      await machine.acceptInvitation('namespace-owner2', 'namespace1', 'namespace-owner2@test.com', 'namespace-owner2');

      await machine.addPaymentEvent('creator-owner', 'namespace1', 'creator-owner', {
        paidBy: [{ user: 'namespace-owner1', amount: 100, currency: 'EUR' }],
        benefitors: [
          { user: 'namespace-owner2', amount: 50, currency: 'EUR' },
          { user: 'namespace-owner1', amount: 50, currency: 'EUR' },
        ],
        description: 'test payment 1',
        created: new Date(),
        edited: new Date(),
        notes: '',
      });

      const creatorOwner = machine.getOwner('creator-owner');
      const namespaceId = machine.getNamespace('namespace1').id;
      const creatorUserId = machine.getNamespaceUser('namespace1', 'creator-owner').id;
      const namespaceOwner1Id = machine.getNamespaceUser('namespace1', 'namespace-owner1').id;

      const settleConfirmResponse = await axios.post(
        `${DATA_PROVIDER_URL}/app/${creatorOwner.key}/namespace/${namespaceId}/settle/confirm/${creatorUserId}`,
        {
          separatedSettlementPerCurrency: true,
          currencies: { 'EUR': 1 },
          mainCurrency: 'EUR',
          paymentEvents: machine.getNamespacePaymentEventIds('namespace1'),
        },
        await machine.getAuthHeaders('creator-owner'));

      const response = await queryDb(
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
});

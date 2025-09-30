import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { settlePreviewApi } from '@angular-monorepo/api-interface';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';
import { ERROR_CODE } from '@angular-monorepo/entities';

const api = settlePreviewApi();
const API_NAME = api.ajax.method + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaceId!: number;
  let userId!: number;
  let creatorUserId!: number;
  let testOwner!: TestOwner;
  let machine!: MockDataMachine;
  let machineState!: MockDataState;
  let paymentEventIds!: number[];

  beforeEach(async () => {
    try {
      machine = new MockDataMachine(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      // Dispose existing test data
      await TestOwner.dispose(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, 'creator');
      await TestOwner.dispose(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, 'test@email.com');

      // Create cluster and namespace with creator
      machineState = await machine.createNewCluster('creator', 'testpassword');
      machineState = await machine.createNewNamespace('testnamespace');
      namespaceId = machineState.selectedNamespace!.id;

      // Create and accept invitation for test owner
      machineState = await machine.createNewInvitation('test@email.com');
      machineState = await machine.acceptInvitation(machineState.getInvitationByEmail('test@email.com'));
      testOwner = await machineState.getUserOwnerByName('test@email.com');

      // Get user IDs
      const user = machineState.getUserByName('test@email.com');
      userId = user.id;
      const creatorUser = machineState.getUserByName('creator');
      creatorUserId = creatorUser.id;

      // Create test payment events
      const paymentEvent1 = await machine.addPaymentEventToNamespace(
        namespaceId, userId, {
          paidBy: [{ userId, amount: 100, currency: 'EUR' }],
          benefitors: [
            { userId: creatorUserId, amount: 50, currency: 'EUR' },
            { userId, amount: 50, currency: 'EUR' },
          ],
          description: 'test payment 1',
          createdBy: userId,
          notes: '',
        });

      const paymentEvent2 = await machine.addPaymentEventToNamespace(
        namespaceId, creatorUserId, {
          paidBy: [{ userId: creatorUserId, amount: 60, currency: 'EUR' }],
          benefitors: [
            { userId: creatorUserId, amount: 30, currency: 'EUR' },
            { userId, amount: 30, currency: 'EUR' },
          ],
          description: 'test payment 2',
          createdBy: creatorUserId,
          notes: '',
        });

      paymentEventIds = [
        paymentEvent1.paymentEvent.id,
        paymentEvent2.paymentEvent.id,
      ];

      await testOwner.login();
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  describe('smoke', () => {
    it('smoke', async () => {
      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
        {
          separatedSettlementPerCurrency: true,
          currencies: { 'EUR': 1 },
          mainCurrency: 'EUR',
          paymentEvents: paymentEventIds,
        },
        testOwner.authHeaders(),
      ));
    });
  });

  describe('validation', () => {
    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
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
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
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

    it('validates namespace exists', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/999999/settle/preview`,
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('validates user has access to namespace', async () => {
      // Create a new namespace where test user is not a member
      const { selectedNamespace : newNamespace } = await machine.createNewNamespace('other-namespace');
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${newNamespace.id}/settle/preview`,
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('validates owner key exists', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invalid-key/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('validates payload with missing fields', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {},
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates payload with missing currencies field', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates payload with missing mainCurrency field', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            paymentEvents: paymentEventIds,
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates negative currency value', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': -1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates invalid currency code', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'INVALID': 1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates invalid main currency', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'INVALID',
            paymentEvents: paymentEventIds,
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates invalid separatedSettlementPerCurrency type', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: 'not-a-boolean',
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates invalid currencies type', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: 'not-an-object',
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates invalid currency value type', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 'not-a-number' },
            mainCurrency: 'EUR',
            paymentEvents: paymentEventIds,
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates empty paymentEvents array', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [],
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates payment event from different namespace', async () => {
      // Create a new namespace and payment event
      const { selectedNamespace: otherNamespace } = await machine.createNewNamespace('other-namespace');
      const otherNamespaceCreatorUser = machineState.getUserByName('creator');
      const otherPaymentEvent = await machine.addPaymentEventToNamespace(
        otherNamespace.id, otherNamespaceCreatorUser.id, {
          paidBy: [{ userId: otherNamespaceCreatorUser.id, amount: 60, currency: 'EUR' }],
          benefitors: [{ userId: otherNamespaceCreatorUser.id, amount: 60, currency: 'EUR' }],
          description: 'test payment in other namespace',
          createdBy: otherNamespaceCreatorUser.id,
          notes: '',
        });

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [otherPaymentEvent.paymentEvent.id],
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates invalid payment event ID', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: [999999],
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates invalid paymentEvents type', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
          {
            separatedSettlementPerCurrency: true,
            currencies: { 'EUR': 1 },
            mainCurrency: 'EUR',
            paymentEvents: 'not-an-array',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
  });

  describe('happy path', () => {
    it('returns correct settlement preview structure', async () => {
      const response = await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/preview`,
        {
          separatedSettlementPerCurrency: true,
          currencies: { 'EUR': 1 },
          mainCurrency: 'EUR',
          paymentEvents: paymentEventIds,
        },
        testOwner.authHeaders(),
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
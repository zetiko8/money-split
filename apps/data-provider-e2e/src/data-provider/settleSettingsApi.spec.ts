import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
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

  beforeEach(async () => {
    try {
      machine = new MockDataMachine(DATA_PROVIDER_URL);

      // Dispose existing test data
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'creator');
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'test@email.com');

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
      await machine.addPaymentEventToNamespace(
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

      await machine.addPaymentEventToNamespace(
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

      await testOwner.login();
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  describe('smoke', () => {
    it('smoke', async () => {
      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/settings`,
      ));
    });
  });

  describe('validation', () => {
    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/settings`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/settings`,
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
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/999999/settle/settings`,
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('validates user has access to namespace', async () => {
      // Create a new namespace where test user is not a member
      const { selectedNamespace : newNamespace } = await machine.createNewNamespace('other-namespace');
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${newNamespace.id}/settle/settings`,
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('validates owner key exists', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/invalid-key/namespace/${namespaceId}/settle/settings`,
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
  });

  describe('happy path', () => {
    it('returns payment events to settle', async () => {
      const response = await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settle/settings`,
        testOwner.authHeaders(),
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
              namespaceId: namespaceId,
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
              namespaceId: namespaceId,
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
          namespaceId: namespaceId,
        },
        editedBy: {
          id: expect.any(Number),
          name: 'test@email.com',
          ownerId: expect.any(Number),
          avatarId: expect.any(Number),
          namespaceId: namespaceId,
        },
        description: 'test payment 1',
        notes: null,
        namespace: {
          id: namespaceId,
          avatarId: expect.any(Number),
          name: 'testnamespace',
        },
        namespaceId,
        paidBy: [
          {
            amount: 100,
            currency: 'EUR',
            user: {
              id: expect.any(Number),
              name: 'test@email.com',
              ownerId: expect.any(Number),
              avatarId: expect.any(Number),
              namespaceId: namespaceId,
            },
          },
        ],
        settlementId: null,
        settledOn: null,
      });
    });

    it.todo('returns empty arrays when no unsettled payments exist');
  });
});
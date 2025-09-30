import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { getEditPaymentEventViewApi } from '@angular-monorepo/api-interface';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';
import { ERROR_CODE } from '@angular-monorepo/entities';

const api = getEditPaymentEventViewApi();
const API_NAME = api.ajax.method + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaceId!: number;
  let userId!: number;
  let creatorUserId!: number;
  let testOwner!: TestOwner;
  let paymentEventId!: number;
  let machine!: MockDataMachine;
  let machineState!: MockDataState;

  beforeEach(async () => {
    try {
      machine = new MockDataMachine(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      // Dispose existing test data
      await TestOwner.dispose(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, 'creator');
      await TestOwner.dispose(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, 'test@email.com');
      await TestOwner.dispose(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, 'otherowner');

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

      // Create test payment event
      const { paymentEvent } = await machine.addPaymentEventToNamespace(
        namespaceId, userId, {
          paidBy: [{ userId, amount: 3, currency: 'EUR' }],
          benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
          description: 'test description',
          notes: 'test notes',
          createdBy: userId,
        });
      paymentEventId = paymentEvent.id;

      await testOwner.login();
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });



  describe('smoke', () => {
    it('smoke', async () => {
      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/payment-event/${paymentEventId}/edit`,
      ));
    });
  });

  describe('validation', () => {
    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/payment-event/${paymentEventId}/edit`,
          {
            headers: {
              Authorization: 'Bearer invalid-token',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('throws 404 when payment event does not exist', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/payment-event/999999/edit`,
          testOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });

    it('throws 404 when namespace does not exist', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/999999/payment-event/${paymentEventId}/edit`,
          testOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });

    it('throws 403 when user is not a member of the namespace', async () => {
      const otherOwner = await MockDataMachine.createNewOwnerAndLogHimIn(DATA_PROVIDER_URL, 'otherowner', 'testpassword');
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/payment-event/${paymentEventId}/edit`,
          otherOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
  });

  describe('happy path', () => {
    it('returns namespace and payment event data', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/payment-event/${paymentEventId}/edit`,
          testOwner.authHeaders(),
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

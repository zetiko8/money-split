import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { getEditPaymentEventViewApi } from '@angular-monorepo/api-interface';
import { TestOwner } from '@angular-monorepo/backdoor';
import { ERROR_CODE, PaymentEvent } from '@angular-monorepo/entities';

const api = getEditPaymentEventViewApi();
const API_NAME = api.ajax.method + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaceId!: number;
  let userId!: number;
  let creatorUserId!: number;
  let testOwner!: TestOwner;
  let creatorOwner!: TestOwner;
  let paymentEvent!: PaymentEvent;
  let paymentEventId!: number;

  beforeEach(async () => {
    try {
      creatorOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'creator',
        'testpassword',
      );
      await creatorOwner.dispose();
      await creatorOwner.register();
      const namespace = await creatorOwner.createNamespace('testnamespace');
      namespaceId = namespace.id;
      const invitation =
        await creatorOwner.inviteToNamespace('test@email.com', namespaceId);
      testOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'invitedowner',
        'testpassword,',
      );
      await testOwner.dispose();
      await testOwner.register();
      await testOwner.acceptInvitation('inviteduser', invitation.invitationKey);
      const user = await testOwner.getUserForNamespace(namespaceId);
      userId = user.id;
      const creatorUser = await testOwner.getUserForNamespace(namespaceId);
      creatorUserId = creatorUser.id;
      paymentEvent = await testOwner.addPaymentEventToNamespace(
        namespaceId, userId, {
          paidBy: [{ userId, amount: 3, currency: 'EUR' }],
          benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
          description: 'test description',
          notes: 'test notes',
          createdBy: userId,
        });
      paymentEventId = paymentEvent.id;
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  afterEach(async () => {
    await testOwner?.dispose();
    await creatorOwner?.dispose();
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
      const otherOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'otherowner',
        'testpassword',
      );
      await otherOwner.dispose();
      await otherOwner.register();

      try {
        await fnCall(API_NAME,
          async () => await axios.get(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/payment-event/${paymentEventId}/edit`,
            otherOwner.authHeaders(),
          ))
          .throwsError(ERROR_CODE.UNAUTHORIZED);
      } finally {
        await otherOwner.dispose();
      }
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

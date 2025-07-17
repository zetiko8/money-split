import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { getPaymentEventApi } from '@angular-monorepo/api-interface';
import { TestOwner } from '@angular-monorepo/backdoor';
import { ERROR_CODE, PaymentEvent } from '@angular-monorepo/entities';

const api = getPaymentEventApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaceId!: number;
  let userId!: number;
  let creatorUserId!: number;
  let paymentEventId!: number;
  let testOwner!: TestOwner;
  let creatorOwner!: TestOwner;

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
      const user
        = await testOwner.getUserForNamespace(namespaceId);
      userId = user.id;
      const creatorUser
        = await testOwner.getUserForNamespace(namespaceId);
      creatorUserId = creatorUser.id;

      // Create a payment event for testing
      const response = await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
        {
          paidBy: [{ userId, amount: 3, currency: 'EUR' }],
          benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
          description: 'test description',
          notes: 'test notes',
        },
        testOwner.authHeaders(),
      );
      paymentEventId = response.data.id;
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/payment-event/${paymentEventId}`,
    ));
  });

  describe('validation', () => {
    it('returns 404 when payment event does not exist', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/payment-event/999999`,
          testOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });

    it('returns 404 when namespace does not exist', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/999999/payment-event/${paymentEventId}`,
          testOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });

    it('returns 401 with missing token', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/payment-event/${paymentEventId}`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('returns 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/payment-event/${paymentEventId}`,
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
    it('returns payment event', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/payment-event/${paymentEventId}`,
          testOwner.authHeaders(),
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

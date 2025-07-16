import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, queryDb, smoke } from '../test-helpers';
import { addPaymentEventApi } from '@angular-monorepo/api-interface';
import { TestOwner } from '@angular-monorepo/backdoor';
import { ERROR_CODE, PaymentEvent } from '@angular-monorepo/entities';

const api = addPaymentEventApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaceId!: number;
  let userId!: number;
  let creatorUserId!: number;
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
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
    ));
  });

  describe('validation', () => {

    it('requires paidBy to be provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            // paidBy is missing (being tested)
            benefitors: [{ userId: creatorUserId, amount: 3 }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates userId is a non-negative bigint in paidBy nodes - string value', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId: 'invalid', amount: 3, currency: 'EUR' }], // being tested - invalid userId type
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates userId is a non-negative bigint in paidBy nodes - float value', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId: 1.5, amount: 3, currency: 'EUR' }], // being tested - float userId
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates userId is a non-negative bigint in paidBy nodes - negative value', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId: -1, amount: 3, currency: 'EUR' }], // being tested - negative userId
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates amount is a number in paidBy nodes', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 'invalid', currency: 'EUR' }], // being tested - invalid amount type
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates currency in paidBy nodes', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'invalid' }], // being tested - invalid currency
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('requires benefitors to be provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3 }],
            // benefitors is missing (being tested)
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates userId is a non-negative bigint in benefitors nodes - string value', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: 'invalid', amount: 3, currency: 'EUR' }], // being tested - invalid userId type
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates userId is a non-negative bigint in benefitors nodes - float value', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: 1.5, amount: 3, currency: 'EUR' }], // being tested - float userId
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates userId is a non-negative bigint in benefitors nodes - negative value', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: -1, amount: 3, currency: 'EUR' }], // being tested - negative userId
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates amount is a number in benefitors nodes', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 'invalid', currency: 'EUR' }], // being tested - invalid amount type
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates currency in benefitors nodes', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'invalid' }], // being tested - invalid currency
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    // TODO: Add validation in router.ts that users exist in the namespace
    it.todo('validates that users in paidBy and benefitors arrays exist in the namespace');

    it('requires paidBy array to not be empty', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [], // being tested
            benefitors: [{ userId: creatorUserId, amount: 3 }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('requires benefitors array to not be empty', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3 }],
            benefitors: [], // being tested
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('requires paidBy nodes to have userId', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ amount: 3 }], // being tested - missing userId
            benefitors: [{ userId: creatorUserId, amount: 3 }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('requires paidBy nodes to have amount', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId }], // being tested - missing amount
            benefitors: [{ userId: creatorUserId, amount: 3 }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('requires benefitor nodes to have userId', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3 }],
            benefitors: [{ amount: 3 }], // being tested - missing userId
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('requires benefitor nodes to have amount', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3 }],
            benefitors: [{ userId: creatorUserId }], // being tested - missing amount
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates description is a string when provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 123, // being tested
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates notes is a string when provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 123, // being tested
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('invalid namespaceId', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${999}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('invalid userId', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${999}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    // TODO: Add validation in router.ts that creator belongs to current owner
    it.todo('validates that the creator belongs to the current owner');

    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
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
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
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

  describe('happy path', () => {
    it('returns a payment event', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()),
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
    let paymentEventId!: number;
    beforeEach(async () => {
      await fnCall(
        API_NAME,
        async () =>
          await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
              description: 'test description',
              notes: 'test notes',
            },
            testOwner.authHeaders(),
          ),
      ).result(async (res: PaymentEvent) => {
        paymentEventId = res.id;
      });
    });

    it('saves payment event in the db', async () => {
      interface PaymentEventDbRow {
        id: number;
        created: Date;
        edited: Date;
        createdBy: number;
        editedBy: number;
        paidBy: string;
        benefitors: string;
        namespaceId: number;
        settlementId: number | null;
        description: string | null;
        notes: string | null;
      }

      const response = (await queryDb(
        `SELECT * FROM PaymentEvent WHERE id = ${paymentEventId}`,
      )) as PaymentEventDbRow[];

      expect(response[0]).toEqual({
        id: paymentEventId,
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: userId,
        editedBy: userId,
        paidBy: JSON.stringify([{ userId, amount: 3, currency: 'EUR' }]),
        benefitors: JSON.stringify([{ userId: creatorUserId, amount: 3, currency: 'EUR' }]),
        namespaceId,
        settlementId: null,
        description: 'test description',
        notes: 'test notes',
      });
      expect(response).toHaveLength(1);
    });
  });
});

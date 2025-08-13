import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, queryDb, smoke } from '../test-helpers';
import { editPaymentEventApi } from '@angular-monorepo/api-interface';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';
import { ERROR_CODE } from '@angular-monorepo/entities';

const api = editPaymentEventApi();
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
      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
      ));
    });
  });

  describe('validation', () => {
    it('requires paidBy to be provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
          {
            // paidBy is missing (being tested)
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates userId is a non-negative bigint in paidBy nodes - string value', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
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
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
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
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
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
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
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
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
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
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            // benefitors is missing (being tested)
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates userId is a non-negative bigint in benefitors nodes - float value', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: 1.5, amount: 3, currency: 'EUR' }], // being tested - float userId
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates amount is a number in benefitors nodes', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 'invalid', currency: 'EUR' }], // being tested - invalid amount type
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it.todo('validates that users in paidBy and benefitors arrays exist in the namespace');

    it('requires paidBy array to not be empty', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
          {
            paidBy: [], // being tested
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('requires benefitors array to not be empty', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
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
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
          {
            paidBy: [{ amount: 3, currency: 'EUR' }], // being tested - missing userId
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('requires benefitor nodes to have userId', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ amount: 3, currency: 'EUR' }], // being tested - missing userId
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates description is a string when provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 123, // being tested - invalid type
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates notes is a string when provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 123, // being tested - invalid type
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('validates payment event exists', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/999999`,
          {
            paidBy: [{ userId, amount: 3, currency: 'EUR' }],
            benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
            description: 'test description',
            notes: 'test notes',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it.todo('validates payment event belongs to namespace');

    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
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
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
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
    it('updates payment event', async () => {
      // Wait a bit to ensure timestamps will be different
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
        {
          paidBy: [{ userId, amount: 5, currency: 'USD' }],
          benefitors: [{ userId: creatorUserId, amount: 5, currency: 'USD' }],
          description: 'updated description',
          notes: 'updated notes',
        },
        testOwner.authHeaders());

      expect(response.data).toEqual({
        id: paymentEventId,
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: userId,
        editedBy: userId,
        paidBy: [{ userId, amount: 5, currency: 'USD' }],
        benefitors: [{ userId: creatorUserId, amount: 5, currency: 'USD' }],
        namespaceId,
        settlementId: null,
        description: 'updated description',
        notes: 'updated notes',
      });

    });

    it('sets edited timestamp newer than created timestamp', async () => {
      // Wait a bit to ensure timestamps will be different
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
        {
          paidBy: [{ userId, amount: 5, currency: 'USD' }],
          benefitors: [{ userId: creatorUserId, amount: 5, currency: 'USD' }],
          description: 'updated description',
          notes: 'updated notes',
        },
        testOwner.authHeaders());

      expect(new Date(response.data.edited).getTime())
        .toBeGreaterThan(new Date(response.data.created).getTime());
    });
  });

  describe('dbState', () => {
    it('persists changes to database', async () => {
      // Make the edit
      await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/edit-payment-event/${paymentEventId}`,
        {
          paidBy: [{ userId, amount: 5, currency: 'USD' }],
          benefitors: [{ userId: creatorUserId, amount: 5, currency: 'USD' }],
          description: 'updated description',
          notes: 'updated notes',
        },
        testOwner.authHeaders());

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

      // Verify by querying the database directly
      const response = (await queryDb(
        `SELECT * FROM PaymentEvent WHERE id = ${paymentEventId}`,
      )) as PaymentEventDbRow[];

      const dbRow = response[0];
      const parsedRow = {
        ...dbRow,
        paidBy: JSON.parse(dbRow.paidBy),
        benefitors: JSON.parse(dbRow.benefitors),
      };

      expect(parsedRow).toEqual({
        id: paymentEventId,
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: userId,
        editedBy: userId,
        paidBy: [{ userId, amount: 5, currency: 'USD' }],
        benefitors: [{ userId: creatorUserId, amount: 5, currency: 'USD' }],
        namespaceId,
        settlementId: null,
        description: 'updated description',
        notes: 'updated notes',
      });
      expect(response).toHaveLength(1);
    });
  });
});

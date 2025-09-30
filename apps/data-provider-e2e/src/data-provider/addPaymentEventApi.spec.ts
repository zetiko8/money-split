import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_PROVIDER_URL, fnCall, queryDb, smoke } from '../test-helpers';
import { addPaymentEventApi } from '@angular-monorepo/api-interface';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';
import { ERROR_CODE, PaymentEvent } from '@angular-monorepo/entities';

const api = addPaymentEventApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaceId!: number;
  let userId!: number;
  let creatorUserId!: number;
  let anotherUserId!: number;
  let testOwner!: TestOwner;
  let machineState!: MockDataState;
  beforeEach(async () => {
    try {
      const machine = new MockDataMachine(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      // dispose any existing owners with the same name
      await machine.dispose('creator');
      await machine.dispose('test@email.com');
      await machine.dispose('another@email.com');

      /**
       * 'creator' creates a namespace and invites 'test@email.com' and 'another@email.com'
       * 'test@email.com' accepts the invitation
       * 'another@email.com' accepts the invitation
       */
      await machine.createNewCluster('creator', 'testpassword');
      await machine.createNewNamespace('testnamespace');
      machineState = await machine.createNewInvitation('test@email.com');
      await machine.acceptInvitation(machineState.getInvitationByEmail('test@email.com'));
      machineState = await machine.createNewInvitation('another@email.com');
      await machine.acceptInvitation(machineState.getInvitationByEmail('another@email.com'));

      // prepare variables for the test
      namespaceId = machineState.selectedNamespace!.id;
      creatorUserId = machineState.getUserByName('creator').id;
      userId = machineState.getUserByName('test@email.com').id;
      anotherUserId = machineState.getUserByName('another@email.com').id;
      testOwner = await machineState.getUserOwnerByName('test@email.com');

      // login as 'test@email.com'
      await testOwner.login();
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  describe('smoke', () => {
    it('smoke', async () => {
      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
      ));
    });
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

  describe('complex payment event validation', () => {
    describe('amount owed must be same as amount paid', () => {
      it('multiple payers must equal benefitors - 2EUR + 3EUR != 4EUR', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [
                { userId, amount: 2, currency: 'EUR' },
                { userId: creatorUserId, amount: 3, currency: 'EUR' },
              ],
              benefitors: [{ userId: anotherUserId, amount: 4, currency: 'EUR' }],
              description: 'test description',
              notes: 'test notes',
            },
            testOwner.authHeaders()))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });

      it('multiple benefitors must equal payers - 5EUR != 2EUR + 2EUR', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 5, currency: 'EUR' }],
              benefitors: [
                { userId: creatorUserId, amount: 2, currency: 'EUR' },
                { userId: anotherUserId, amount: 2, currency: 'EUR' },
              ],
              description: 'test description',
              notes: 'test notes',
            },
            testOwner.authHeaders()))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });

      it('amounts must be positive - negative payer amount', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: -3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
              description: 'test description',
              notes: 'test notes',
            },
            testOwner.authHeaders()))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });

      it('amounts must be positive - negative benefitor amount', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: -3, currency: 'EUR' }],
              description: 'test description',
              notes: 'test notes',
            },
            testOwner.authHeaders()))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });
      it('3 EUR != 4 EUR', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 4, currency: 'EUR' }],
              description: 'a',
              notes: 'a',
            },
            testOwner.authHeaders()))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });
      it('3 EUR == 3 EUR', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
              description: 'a',
              notes: 'a',
            },
            testOwner.authHeaders()))
          .toBe200();
      });

      it('3 EUR != 4 USD', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 4, currency: 'USD' }],
              description: 'a',
              notes: 'a',
            },
            testOwner.authHeaders()))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });

      it('4 USD == 4 USD', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 4, currency: 'USD' }],
              benefitors: [{ userId: creatorUserId, amount: 4, currency: 'USD' }],
              description: 'a',
              notes: 'a',
            },
            testOwner.authHeaders()))
          .toBe200();
      });

      it('3 EUR + 3 EUR != 4 EUR', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }, { userId: creatorUserId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 4, currency: 'EUR' }],
              description: 'a',
              notes: 'a',
            },
            testOwner.authHeaders()))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });

      it('3 EUR + 3 EUR == 6 EUR', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
            {
              paidBy: [{ userId, amount: 3, currency: 'EUR' }, { userId: creatorUserId, amount: 3, currency: 'EUR' }],
              benefitors: [{ userId: creatorUserId, amount: 6, currency: 'EUR' }],
              description: 'a',
              notes: 'a',
            },
            testOwner.authHeaders()))
          .toBe200();
      });

      it('allows multiple currencies if sums match - EUR and USD', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
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
            testOwner.authHeaders()))
          .toBe200();
      });

      it('fails if any currency sum does not match - EUR matches but USD does not', async () => {
        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add-payment-event`,
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
            testOwner.authHeaders()))
          .throwsError(ERROR_CODE.INVALID_REQUEST);
      });
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
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
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
        paidBy: [{ userId, amount: 3, currency: 'EUR' }],
        benefitors: [{ userId: creatorUserId, amount: 3, currency: 'EUR' }],
        namespaceId,
        settlementId: null,
        description: 'test description',
        notes: 'test notes',
      });
      expect(response).toHaveLength(1);
    });
  });
});

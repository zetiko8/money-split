import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, queryDb, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { createInvitationApi } from '@angular-monorepo/api-interface';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';

const api = createInvitationApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let testOwner!: TestOwner;
  let namespaceId!: number;
  let ownerKey!: string;
  let ownerId!: number;
  let machineState!: MockDataState;

  beforeEach(async () => {
    try {
      const machine = new MockDataMachine(DATA_PROVIDER_URL);

      // dispose any existing owners with the same name
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'testowner');

      // Create new cluster and namespace
      await machine.createNewCluster('testowner', 'testpassword');
      machineState = await machine.createNewNamespace('testnamespace1');

      // Get owner and IDs
      testOwner = await machineState.getUserOwnerByName('testowner');
      namespaceId = machineState.selectedNamespace!.id;
      ownerKey = testOwner.owner.key;
      ownerId = testOwner.owner.id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw Error('beforeEach error: ' + error.message);
      }
      throw Error('beforeEach error: ' + String(error));
    }
  });

  describe('smoke', () => {
    it('should handle basic invitation request', async () => {
      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
      ));
    });
  });

  describe('validation', () => {
    it('requires email to be provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {},
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('requires email to be a string', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 2,
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it.todo('requires email to be a valid email');

    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {},
          {
            headers: {
              'Authorization': 'Bearer invalid',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it.todo('throws 401 with invalid ownerKey');

    it('can not invite same email twice', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          testOwner.authHeaders(),
        ))
        .result((() => void 0));
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          testOwner.authHeaders(),
        )).throwsError(ERROR_CODE.RESOURCE_ALREADY_EXISTS);
    });
  });

  describe('happy path', () => {
    it('returns an invitation', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          testOwner.authHeaders(),
        ))
        .result((result => {
          expect(result).toEqual({
            namespaceId: namespaceId,
            accepted: false,
            rejected: false,
            id: expect.any(Number),
            email: 'test.email@test.com',
            created: expect.any(String),
            edited: expect.any(String),
            createdBy: ownerId,
            editedBy: ownerId,
            invitationKey: expect.any(String),
          });
        }));
    });

    it.todo('sends an invitation email');
  });

  describe('dbState', () => {
    let invitationId!: number;
    beforeEach(async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          testOwner.authHeaders(),
        ))
        .result((async (res: { id: number }) => {
          invitationId = res.id;
        }));
    });
    it('saves invitation in the db', async () => {
      const response = await queryDb(
        `
        SELECT * FROM Invitation
        WHERE id = ${invitationId}
        `,
      );
      expect(response[0]).toEqual({
        namespaceId: namespaceId,
        accepted: 0,
        rejected: 0,
        id: expect.any(Number),
        email: 'test.email@test.com',
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: ownerId,
        editedBy: ownerId,
        invitationKey: expect.any(String),
      });
      expect(response).toHaveLength(1);
    });
  });
});

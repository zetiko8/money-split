import axios from 'axios';
import { DATA_PROVIDER_URL, expectEqual, fnCall, queryDb, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';
import { createNamespaceApi } from '@angular-monorepo/api-interface';

const api = createNamespaceApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let testOwner!: TestOwner;
  let machineState!: MockDataState;

  beforeEach(async () => {
    try {
      const machine = new MockDataMachine(DATA_PROVIDER_URL);

      // dispose any existing owners with the same name
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'testowner');

      // Create new cluster
      machineState = await machine.createNewCluster('testowner', 'testpassword');

      // Get owner
      testOwner = await machineState.getUserOwnerByName('testowner');
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw Error('beforeEach error: ' + error.message);
      }
      throw Error('beforeEach error: ' + String(error));
    }
  });

  describe('smoke', () => {
    it('should handle basic namespace creation', async () => {
      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
        {
          namespaceName: 'testnamespace',
          avatarColor: 'green',
        },
        testOwner.authHeaders(),
      ));
    });
  });

  describe('validation', () => {
    it('requires namespaceName to be provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
          {
            avatarUrl: 'http://url.com',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
          {
            avatarUrl: 'http://url.com',
            namespaceName: '  ',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('requires either avatarUrl or avatarColor to be provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
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
  });

  describe('happy path', () => {
    it('returns a namespace', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          testOwner.authHeaders(),
        ))
        .result((result => {
          expect(result).toHaveProperty('avatarId');
          expect(typeof result.avatarId).toBe('number');
          expect(result).toHaveProperty('id');
          expect(typeof result.id).toBe('number');
          expect(result).toHaveProperty('name');
          expect(typeof result.name).toBe('string');
        }));
    });

    it('trims the namespace name', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
          {
            namespaceName: '  testnamespace  ',
            avatarColor: 'green',
          },
          testOwner.authHeaders(),
        ))
        .result((result => {
          expect(result.name).toBe('testnamespace');
        }));
    });
    it('can not have two namespaces with same name', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          testOwner.authHeaders(),
        ))
        .result((() => void 0));
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          testOwner.authHeaders(),
        )).throwsError(ERROR_CODE.RESOURCE_ALREADY_EXISTS);
    });
  });

  describe('db state', () => {
    let namespaceId!: number;
    let avatarId!: number;
    beforeEach(async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          testOwner.authHeaders(),
        ))
        .result((async res => {
          namespaceId = res.id;
          avatarId = res.avatarId;
        }));
    });
    it('saves namespace in the db', async () => {
      const response = await queryDb(
        `
        SELECT * FROM Namespace
        WHERE id = ${namespaceId}
        `,
      );
      expectEqual(
        { id: namespaceId, name: 'testnamespace', avatarId: '_type_number_' },
        response[0],
      );
      expect(response).toHaveLength(1);
    });
    it('saves namespace avatar in db', async () => {
      const response = await queryDb(
        `
        SELECT * FROM Avatar
        WHERE id = ${avatarId}
        `,
      );
      expectEqual(
        { id: avatarId, color: 'green', dataUrl: null, url: null },
        response[0],
      );
      expect(response).toHaveLength(1);
    });
    it('adds owner to namespace', async () => {
      const response = await queryDb(
        `
        SELECT * FROM NamespaceOwner
        WHERE namespaceId = ${namespaceId}
        AND ownerId = ${testOwner.owner.id}
        `,
      );
      expectEqual(
        { ownerId: testOwner.owner.id, namespaceId },
        response[0],
      );
      expect(response).toHaveLength(1);
    });
    it('adds user to namespace', async () => {
      const users = await queryDb(
        `
        SELECT * FROM \`User\`
        WHERE namespaceId = ${namespaceId}
        AND name = '${testOwner.owner.username}'
        `,
      );
      expect(users).toHaveLength(1);
      expectEqual(
        {
          id: '_type_number_',
          name: testOwner.owner.username,
          namespaceId: namespaceId,
          ownerId: testOwner.owner.id,
          avatarId: testOwner.owner.avatarId,
        },
        users[0],
      );
    });
  });
  describe('db state - triming', () => {
    let namespaceId!: number;
    beforeEach(async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
          {
            namespaceName: '  testnamespace  ',
            avatarColor: 'green',
          },
          testOwner.authHeaders(),
        ))
        .result((async res => {
          namespaceId = res.id;
        }));
    });
    it('trims the namespace name', async () => {
      const response = await queryDb(
        `
        SELECT * FROM Namespace
        WHERE id = ${namespaceId}
        `,
      );
      expect(response[0].name).toEqual('testnamespace');
    });
  });
});

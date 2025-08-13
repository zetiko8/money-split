import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, queryDb, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';
import { editNamespaceSettingApi } from '@angular-monorepo/api-interface';

const api = editNamespaceSettingApi();
const API_NAME = api.ajax.method + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let testOwner!: TestOwner;
  let namespaceId!: number;
  let machineState!: MockDataState;
  let machine!: MockDataMachine;

  beforeEach(async () => {
    try {
      machine = new MockDataMachine(DATA_PROVIDER_URL);

      // dispose any existing owners with the same name
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'testowner');

      // Create new cluster and namespace
      machineState = await machine.createNewCluster('testowner', 'testpassword');
      machineState = await machine.createNewNamespace('originalnamespace');

      // Get owner and namespace ID
      testOwner = await machineState.getUserOwnerByName('testowner');
      namespaceId = machineState.selectedNamespace!.id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw Error('beforeEach error: ' + error.message);
      }
      throw Error('beforeEach error: ' + String(error));
    }
  });

  describe('smoke', () => {
    it('should handle basic namespace settings update', async () => {
      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
        {
          namespaceName: 'newnamespace',
          avatarColor: 'blue',
        },
        testOwner.authHeaders(),
      ));
    });
  });

  describe('validation', () => {
    it('requires namespaceName to be provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
          {
            avatarColor: 'green',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
          {
            namespaceName: '  ',
            avatarColor: 'green',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('requires either avatarUrl or avatarColor to be provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
          {
            namespaceName: 'newnamespace',
          },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
          {},
          {
            headers: {
              'Authorization': 'Bearer invalid',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('throws 401 with invalid ownerKey', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invalid/namespace/${namespaceId}/settings`,
          {
            namespaceName: 'newnamespace',
            avatarColor: 'blue',
          },
          testOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('can not change to a duplicate namespace name', async () => {
      await machine.createNewNamespace('duplicatename');
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
          {
            namespaceName: 'duplicatename',
            avatarColor: 'green',
          },
          testOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.RESOURCE_ALREADY_EXISTS);
    });

  });

  describe('happy path', () => {
    it('returns updated namespace settings', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
          {
            namespaceName: 'updatednamespace',
            avatarColor: 'red',
            avatarUrl: 'my//url',
          },
          testOwner.authHeaders(),
        ))
        .result((result => {
          expect(result).toEqual({
            avatarColor: 'red',
            avatarImage: null,
            avatarUrl: 'my//url',
            namespaceName: 'updatednamespace',
          });
        }));
    });

    it('trims the namespace name', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
          {
            namespaceName: '  changedNamespace name  ',
            avatarColor: 'green',
          },
          testOwner.authHeaders(),
        ))
        .result((result => {
          expect(result.namespaceName).toBe('changedNamespace name');
        }));
    });

    it('can leave everything the name as it is', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
          {
            namespaceName: 'originalnamespace',
            avatarColor: 'red',
            avatarUrl: 'my//url',
          },
          testOwner.authHeaders(),
        ))
        .result((result => {
          expect(result).toEqual({
            avatarColor: 'red',
            avatarImage: null,
            avatarUrl: 'my//url',
            namespaceName: 'originalnamespace',
          });
        }));
    });
  });

  describe('db state', () => {
    beforeEach(async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
          {
            namespaceName: 'dbtestnamespace',
            avatarColor: 'yellow',
          },
          testOwner.authHeaders(),
        ))
        .result(() => void 0);
    });
    it('updates namespace in the db', async () => {
      const response = await queryDb(
        `
        SELECT * FROM Namespace
        WHERE id = ${namespaceId}
        `,
      );
      expect(response[0]).toEqual({
        id: namespaceId,
        avatarId: expect.any(Number),
        name: 'dbtestnamespace',
      });
    });
    it('updates namespace avatar in db', async () => {
      const response = await queryDb(
        `
        SELECT a.* FROM Avatar a
        LEFT JOIN Namespace n
        ON a.id = n.avatarId
        WHERE n.id = ${namespaceId}
        `,
      );

      expect(response[0]).toEqual({
        id: expect.any(Number),
        color: 'yellow',
        dataUrl: null,
        url: null,
      });
    });

    describe('triming', () => {
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
});


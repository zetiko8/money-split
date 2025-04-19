import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, queryDb, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { TestOwner } from '@angular-monorepo/backdoor';
import { editNamespaceSettingApi } from '@angular-monorepo/api-interface';

const api = editNamespaceSettingApi();
const API_NAME = api.ajax.method + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let testOwner!: TestOwner;
  let namespaceId!: number;
  beforeEach(async () => {
    testOwner = new TestOwner(
      DATA_PROVIDER_URL,
      'testowner',
      'testpassword',
    );
    await testOwner.dispose();
    await testOwner.register();
    const namespace = await testOwner.createNamespace('originalnamespace');
    namespaceId = namespace.id;
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
      {
        namespaceName: 'newnamespace',
        avatarColor: 'blue',
      },
      testOwner.authHeaders(),
    ));
  });

  it('requires namespaceName to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
        {
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
        `${DATA_PROVIDER_URL}/app/invalidOwnerKey/namespace/${namespaceId}/settings`,
        {
          namespaceName: 'newnamespace',
          avatarColor: 'blue',
        },
        testOwner.authHeaders(),
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });

  it('can not change to a duplicate namespace name', async () => {
    // Create another namespace with the target name
    await testOwner.createNamespace('duplicatename');
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/settings`,
        {
          namespaceName: 'duplicatename',
          avatarColor: 'green',
        },
        testOwner.authHeaders(),
      ))
      .throwsError('RESOURCE_ALREADY_EXISTS');
  });

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
        .result(() => {
          //
        });
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
  });
});


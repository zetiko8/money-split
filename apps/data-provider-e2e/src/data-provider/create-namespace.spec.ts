import axios from 'axios';
import { DATA_PROVIDER_URL, expectEqual, fnCall, queryDb, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { BACKDOOR_ACTIONS } from '@angular-monorepo/backdoor';
import { createNamespaceApi } from '@angular-monorepo/api-interface';

const api = createNamespaceApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let ownerKey!: string;
  let ownerId!: number;
  let ownerAvatarId!: number;
  let ownerUsername!: string;
  let token!: string;
  beforeAll(async () => {
    try {
      await BACKDOOR_ACTIONS.deleteOwner(
        DATA_PROVIDER_URL,
        'testusername',
      );

    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }

    try {
      const owner = await BACKDOOR_ACTIONS.registerOwner(
        DATA_PROVIDER_URL,
        'testusername',
        'testpassword',
      );

      ownerKey = owner.key;
      ownerId = owner.id;
      ownerUsername = owner.username;
      ownerAvatarId = owner.avatarId;

    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }

    try {
      const response = await axios.post(
        `${DATA_PROVIDER_URL}/app/login`,
        {
          username: 'testusername',
          password: 'testpassword',
        },
      );

      token = response.data.token;

    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  beforeEach(async () => {
    try {
      await BACKDOOR_ACTIONS.deleteNamespaceByName(
        DATA_PROVIDER_URL,
        'testnamespace',
      );

    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }

    try {
      await BACKDOOR_ACTIONS.deleteUser(
        DATA_PROVIDER_URL,
        'testuser',
      );

    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace`));
  });
  it('requires namespaceName to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace`,
        {
          avatarUrl: 'http://url.com',
        },
        {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        }))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('requires either avatarUrl or avatarColor to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace`,
        {
          namespaceName: 'testnamespace',
        },
        {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        }))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace`,
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace`,
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
  it('returns a namespace', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace`,
        {
          namespaceName: 'testnamespace',
          avatarColor: 'green',
        },
        {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        },
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
  it('can not have two namespaces with same name', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace`,
        {
          namespaceName: 'testnamespace',
          avatarColor: 'green',
        },
        {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        },
      ))
      .result((() => {}));
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace`,
        {
          namespaceName: 'testnamespace',
          avatarColor: 'green',
        },
        {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        },
      )).throwsError('RESOURCE_ALREADY_EXISTS');
  });
  describe('db state', () => {
    let namespaceId!: number;
    let avatarId!: number;
    beforeEach(async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          {
            headers: {
              'Authorization': 'Bearer ' + token,
            },
          },
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
        AND ownerId = ${ownerId}
        `,
      );
      expectEqual(
        { ownerId, namespaceId },
        response[0],
      );
      expect(response).toHaveLength(1);
    });
    it('adds user to namespace', async () => {
      const users = await queryDb(
        `
        SELECT * FROM \`User\`
        WHERE namespaceId = ${namespaceId}
        AND name = '${ownerUsername}'
        `,
      );
      expect(users).toHaveLength(1);
      expectEqual(
        {
          id: '_type_number_',
          name: ownerUsername,
          namespaceId: namespaceId,
          ownerId: ownerId,
          avatarId: ownerAvatarId,
        },
        users[0],
      );
    });
  });
});

import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { BACKDOOR_ACTIONS } from '@angular-monorepo/backdoor';
import { getNamespaceViewApi } from '@angular-monorepo/api-interface';

const api = getNamespaceViewApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let ownerKey!: string;
  let ownerKeyOtherOwner!: string;
  let namespaceId!: number;
  let ownerId!: number;
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
      await BACKDOOR_ACTIONS.deleteOwner(
        DATA_PROVIDER_URL,
        'otherowner',
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

    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }

    try {
      const owner = await BACKDOOR_ACTIONS.registerOwner(
        DATA_PROVIDER_URL,
        'otherowner',
        'testpassword',
      );

      ownerKeyOtherOwner = owner.key;

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
      throw Error('beforeEach error: ' + error.message);
    }

    try {
      await BACKDOOR_ACTIONS.deleteUser(
        DATA_PROVIDER_URL,
        'testuser',
      );

    } catch (error) {
      throw Error('beforeEach error: ' + error.message);
    }

    try {
      const namespace = await BACKDOOR_ACTIONS.createNamespace(
        DATA_PROVIDER_URL,
        'testnamespace',
        ownerKey,
      );

      namespaceId = namespace.id;

    } catch (error) {
      throw Error('beforeEach error: ' + error.message);
    }
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}`));
  });
  it('throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}`,
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
  it('throws 401 with invalid ownerKey', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKeyOtherOwner}/namespace/${namespaceId}`,
        {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it('namespace does not exist', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/20000000`,
        {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        }))
      .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
  });
  it('returns a namespace view', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}`,
        {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        },
      ))
      .result((result => {
        expect(result).toEqual(    {
          id: namespaceId,
          name: 'testnamespace',
          invitations: [],
          users: [
            {
              id: expect.any(Number),
              name: 'testusername',
              namespaceId: namespaceId,
              ownerId: ownerId,
              avatarId: expect.any(Number),
            },
          ],
          ownerUsers: [
            {
              id: expect.any(Number),
              name: 'testusername',
              namespaceId: namespaceId,
              ownerId: ownerId,
              avatarId: expect.any(Number),
            },
          ],
          records: [],
          avatarId: expect.any(Number),
          hasRecordsToSettle: false,
          settlements: [],
        });
      }));
  });
});

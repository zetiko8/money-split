import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { BACKDOOR_ACTIONS, NamespaceTestResource } from '@angular-monorepo/backdoor';
import { getOwnerProfileApi } from '@angular-monorepo/api-interface';

const api = getOwnerProfileApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let ownerKey!: string;
  let ownerKeyOtherOwner!: string;
  let ownerId!: number;
  let token!: string;
  const namespace1 = new NamespaceTestResource(
    DATA_PROVIDER_URL, 'testnamespace');
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
    await namespace1.dispose();
    await namespace1.setup(ownerKey);
  });

  it.only('smoke', async () => {
    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`));
  });
  it.only('throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`,
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`,
        {},
        {
          headers: {
            'Authorization': 'Bearer invalid',
          },
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it.only('throws 401 with invalid ownerKey', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKeyOtherOwner}/profile`,
        {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it.only('returns an owner profile view', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`,
        {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        },
      ))
      .result((result => {
        expect(result).toEqual({
          avatar: {
            id: expect.any(Number),
            color: expect.any(String),
            url: 'null',
          },
          owner: {
            key: ownerKey,
            id: ownerId,
            username: 'testusername',
            avatarId: expect.any(Number),
          },
          users: [
            {
              user: {
                id: expect.any(Number),
                name: 'testusername',
                namespaceId: namespace1.namespaceId,
                ownerId: ownerId,
                avatarId: expect.any(Number),
              },
              avatar: {
                id: expect.any(Number),
                color: expect.any(String),
                url: 'null',
              },
            },
          ],
        });
      }));
  });
});

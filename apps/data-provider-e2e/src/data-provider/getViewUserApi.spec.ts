import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke, testEnv, throwBeforeEachError } from '../test-helpers';
import { ERROR_CODE, User } from '@angular-monorepo/entities';
import { getViewUserApi } from '@angular-monorepo/api-interface';
import { BACKDOOR_ACTIONS, TestOwner, TestScenarioNamespace } from '@angular-monorepo/backdoor';
import moment from 'moment';

const api = getViewUserApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let userId!: number;
  let namespaceId!: number;
  let ownerKey!: string;
  let ownerKeyOtherOwner!: string;
  let creatorOwner!: TestOwner;
  let scenario!: TestScenarioNamespace;
  let user!: User;

  beforeEach(async () => {
    try {
      scenario = await BACKDOOR_ACTIONS.SCENARIO.scenarios[1](
        moment,
        testEnv().DATA_PROVIDER_URL,
        testEnv().BACKDOOR_USERNAME,
        testEnv().BACKDOOR_PASSWORD,
      );

      creatorOwner = scenario.creator.owner;
      ownerKey = creatorOwner.owner.key;
      namespaceId = scenario.namespaceId;
      ownerKeyOtherOwner = (scenario.allUsers.find(u => u.owner.owner.id !== creatorOwner.owner.id)).owner.owner.key;
      userId = (scenario.allUsers.find(u => u.owner.owner.id !== creatorOwner.owner.id)).user.id;
      user = (scenario.allUsers.find(u => u.owner.owner.id !== creatorOwner.owner.id)).user;
    } catch (error) {
      throwBeforeEachError(error);
    }
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/user/${userId}`));
  });
  it('throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/user/${userId}`,
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/user/${userId}`,
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
        `${DATA_PROVIDER_URL}/app/${ownerKeyOtherOwner}/namespace/${namespaceId}/user/${userId}`,
        creatorOwner.authHeaders(),
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it.todo('throws 401 with namespace that does not belong to a owner');
  it.todo('throws 401 with user that does not belong to a namespace');
  it.todo('namespace does not exist',
    // async () => {
    //   await fnCall(API_NAME,
    //     async () => await axios.get(
    //       `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/20000000/user/${userId}`,
    //       creatorOwner.authHeaders(),
    //     ))
    //     .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    // }
  );
  it.todo('user does not exist');
  it('returns a namespace view', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/user/${userId}`,
        creatorOwner.authHeaders(),
      ))
      .result((result => {
        expect(result).toEqual({
          user: {
            avatarId: expect.any(Number),
            name: user.name,
            namespaceId,
            ownerId: user.ownerId,
            id: user.id,
          },
          namespace: {
            avatarId: expect.any(Number),
            name: scenario.namespace.name,
            id: namespaceId,
          },
        });
      }));
  });

});

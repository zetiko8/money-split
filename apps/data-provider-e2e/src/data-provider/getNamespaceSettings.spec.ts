import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke, testEnv } from '../test-helpers';
import { ERROR_CODE, MNamespaceSettings } from '@angular-monorepo/entities';
import { getNamespaceSettingsApi } from '@angular-monorepo/api-interface';
import { BACKDOOR_ACTIONS, TestOwner, TestScenarioNamespace } from '@angular-monorepo/backdoor';

const api = getNamespaceSettingsApi();
const API_NAME = api.ajax.method + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('basics', () => {
    let ownerKey!: string;
    let ownerKeyOtherOwner!: string;
    let testOwner!: TestOwner;
    let otherOwner!: TestOwner;
    let namespaceId!: number;
    let scenario!: TestScenarioNamespace;

    beforeEach(async () => {
      scenario = await BACKDOOR_ACTIONS.SCENARIO.prepareNamespace(
        testEnv().DATA_PROVIDER_URL,
        testEnv().BACKDOOR_USERNAME,
        testEnv().BACKDOOR_PASSWORD,
        'testnamespace',
        {  username: 'testuser'},
        [
          {  username: 'atestuser1'},
          {  username: 'btestuser2'},
          {  username: 'ctestuser3'},
        ],
      );

      testOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;
      ownerKey = testOwner.owner.key;

      otherOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'otherOwner',
        'testpassword',
      );
      await otherOwner.dispose();
      await otherOwner.register();
      ownerKeyOtherOwner = otherOwner.owner.key;
    });

    it('smoke', async () => {
      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/settings`));
    });

    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/settings`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/settings`,
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
          `${DATA_PROVIDER_URL}/app/${ownerKeyOtherOwner}/namespace/${namespaceId}/settings`,
          testOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('namespace does not exist', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/20000000/settings`,
          testOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it('returns namespace settings', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/settings`,
          testOwner.authHeaders(),
        ))
        .result((result: MNamespaceSettings) => {
          expect(result).toEqual({
            avatarColor: expect.any(String),
            avatarImage: null,
            avatarUrl: null,
            namespaceName: 'testnamespace',
          });
        });
    });
  });
});


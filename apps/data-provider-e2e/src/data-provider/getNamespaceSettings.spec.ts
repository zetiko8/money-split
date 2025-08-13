import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { ERROR_CODE, MNamespaceSettings } from '@angular-monorepo/entities';
import { getNamespaceSettingsApi } from '@angular-monorepo/api-interface';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';

const api = getNamespaceSettingsApi();
const API_NAME = api.ajax.method + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  let ownerKey!: string;
  let ownerKeyOtherOwner!: string;
  let testOwner!: TestOwner;
  let otherOwner!: TestOwner;
  let namespaceId!: number;
  let machine!: MockDataMachine;
  let machineState!: MockDataState;

  beforeEach(async () => {
    try {
      machine = new MockDataMachine(DATA_PROVIDER_URL);

      // Dispose existing test data
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'creator');
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'otherowner');

      // Create cluster and namespace with creator
      machineState = await machine.createNewCluster('creator', 'testpassword');
      machineState = await machine.createNewNamespace('testnamespace');
      namespaceId = machineState.selectedNamespace!.id;
      testOwner = await machineState.getUserOwnerByName('creator');
      ownerKey = testOwner.owner.key;

      // Create other owner for validation tests
      otherOwner = await MockDataMachine.createNewOwnerAndLogHimIn(DATA_PROVIDER_URL, 'otherowner', 'testpassword');
      ownerKeyOtherOwner = otherOwner.owner.key;
    } catch (error) {
      throw Error('beforeEach error: ' + error.message);
    }
  });

  describe('smoke', () => {
    it('smoke', async () => {
      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/settings`));
    });
  });

  describe('validation', () => {
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
  });

  describe('happy path', () => {
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



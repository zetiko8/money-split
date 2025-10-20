import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';
import { editOwnerProfileApi } from '@angular-monorepo/api-interface';
import { getRandomColor } from '@angular-monorepo/utils';

const api = editOwnerProfileApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

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
      machine = new MockDataMachine(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      // Dispose existing owners
      await TestOwner.dispose(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, 'testowner');
      await TestOwner.dispose(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, 'otherowner');

      // Create first owner and namespace
      machineState = await machine.createNewCluster('testowner', 'testpassword');
      machineState = await machine.createNewNamespace('testnamespace');
      testOwner = await machineState.getUserOwnerByName('testowner');
      namespaceId = machineState.selectedNamespace!.id;
      ownerKey = testOwner.owner.key;

      // Create second owner
      otherOwner = await MockDataMachine.createNewOwnerAndLogHimIn(DATA_PROVIDER_URL, 'otherowner', 'testpassword');
      ownerKeyOtherOwner = otherOwner.owner.key;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw Error('beforeEach error: ' + error.message);
      }
      throw Error('beforeEach error: ' + String(error));
    }
  });

  describe('smoke', () => {
    testWrap('', 'smoke', async () => {
      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`));
    });
  });

  describe('validation', () => {
    testWrap('', 'throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`,
          {
            ownerAvatar: {
              avatarColor: '#FFFH',
              avatarUrl: null,
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`,
          {
            ownerAvatar: {
              avatarColor: '#FFFH',
              avatarUrl: null,
            },
          },
          {
            headers: {
              'Authorization': 'Bearer invalid',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'throws 401 with invalid ownerKey', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKeyOtherOwner}/profile`,
          {
            ownerAvatar: {
              avatarColor: '#FFFH',
              avatarUrl: null,
            },
          },
          testOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns an owner profile view', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`,
          {
            ownerAvatar: {
              avatarColor: getRandomColor(),
              avatarUrl: null,
            },
          },
          testOwner.authHeaders(),
        ))
        .result((result => {
          expect(result).toEqual({
            avatar: {
              id: expect.any(Number),
              color: expect.any(String),
              url: null,
            },
            owner: {
              key: ownerKey,
              id: testOwner.owner.id,
              username: testOwner.owner.username,
              avatarId: expect.any(Number),
            },
            users: [
              {
                user: {
                  id: expect.any(Number),
                  name: testOwner.owner.username,
                  namespaceId: namespaceId,
                  ownerId: testOwner.owner.id,
                  avatarId: expect.any(Number),
                },
                avatar: {
                  id: expect.any(Number),
                  color: expect.any(String),
                  url: null,
                },
              },
            ],
          });
        }));
    });

    testWrap('', 'updates url and color', async () => {
      const newColor = getRandomColor();
      const newUrl = 'https://example.com';
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`,
          {
            ownerAvatar: {
              avatarColor: newColor,
              avatarUrl: newUrl,
            },
          },
          testOwner.authHeaders(),
        ))
        .result((result => {
          expect(result).toEqual({
            avatar: {
              id: expect.any(Number),
              color: newColor,
              url: newUrl,
            },
            owner: {
              key: ownerKey,
              id: testOwner.owner.id,
              username: testOwner.owner.username,
              avatarId: expect.any(Number),
            },
            users: [
              {
                user: {
                  id: expect.any(Number),
                  name: testOwner.owner.username,
                  namespaceId: namespaceId,
                  ownerId: testOwner.owner.id,
                  avatarId: expect.any(Number),
                },
                avatar: {
                  id: expect.any(Number),
                  color: newColor,
                  url: newUrl,
                },
              },
            ],
          });
        }));
    });
  });
});

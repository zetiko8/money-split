import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { MockDataMachine, TestOwner } from '@angular-monorepo/backdoor';
import { getOwnerProfileApi } from '@angular-monorepo/api-interface';

const api = getOwnerProfileApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let ownerKey!: string;
  let ownerKeyOtherOwner!: string;
  let testOwner!: TestOwner;
  let otherOwner!: TestOwner;
  let namespaceId!: number;
  let machine!: MockDataMachine;

  beforeEach(async () => {
    // Clean up existing test data
    await MockDataMachine.dispose(DATA_PROVIDER_URL, 'testowner');
    await MockDataMachine.dispose(DATA_PROVIDER_URL, 'otherowner');

    // Create test owners and namespaces using MockDataMachine
    machine = new MockDataMachine(DATA_PROVIDER_URL);
    await machine.initialize();

    // Create test owner with namespace
    const testOwnerState = await machine.createNewCluster('testowner', 'testpassword');
    testOwner = await testOwnerState.getUserOwnerByName('testowner');
    const namespace = await testOwner.createNamespace('testnamespace');
    namespaceId = namespace.id;
    ownerKey = testOwner.owner.key;

    // Create other owner
    const otherOwnerState = await machine.createNewCluster('otherowner', 'testpassword');
    otherOwner = await otherOwnerState.getUserOwnerByName('otherowner');
    ownerKeyOtherOwner = otherOwner.owner.key;
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`));
  });
  it('throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`,
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`,
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
        `${DATA_PROVIDER_URL}/app/${ownerKeyOtherOwner}/profile`,
        testOwner.authHeaders(),
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it('returns an owner profile view', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/profile`,
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
});

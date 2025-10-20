import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { getOwnerNamespacesApi } from '@angular-monorepo/api-interface';
import { MockDataMachine, TestOwner } from '@angular-monorepo/backdoor';

const api = getOwnerNamespacesApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaces!: { namespaceId: number }[];
  let testOwner!: TestOwner;
  let machine!: MockDataMachine;

  beforeEach(async () => {
    // Create test owners and namespaces using MockDataMachine
    machine = new MockDataMachine(
      DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

    await machine.dispose('testowner');
    await machine.initialize();

    // Create test owner with multiple namespaces
    const testOwnerState = await machine.createNewCluster('testowner', 'testpassword');
    testOwner = await testOwnerState.getUserOwnerByName('testowner');
    const namespace1 = await testOwner.createNamespace('testnamespace1');
    const namespace2 = await testOwner.createNamespace('testnamespace2');
    const namespace3 = await testOwner.createNamespace('testnamespace3');
    namespaces = [namespace1, namespace2, namespace3]
      .map(ns => ({ namespaceId: ns.id }));
  });

  testWrap('', 'smoke', async () => {
    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
    ));
  });
  it.todo('invalid owner key - does not match owner id');
  testWrap('', 'throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
        {
          headers: {
            'Authorization': 'Bearer invalid',
          },
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  testWrap('', 'returns an namespaces for owner', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
        testOwner.authHeaders()))
      .result((result => {
        expect(result).toEqual([
          {
            avatarId: expect.any(Number),
            id: namespaces[0].namespaceId,
            name: 'testnamespace1',
          },
          {
            avatarId: expect.any(Number),
            id: namespaces[1].namespaceId,
            name: 'testnamespace2',
          },
          {
            avatarId: expect.any(Number),
            id: namespaces[2].namespaceId,
            name: 'testnamespace3',
          },
        ]);
      }));
  });
});

describe(API_NAME + ' bugs', () => {
  let testOwner!: TestOwner;
  let machine!: MockDataMachine;

  beforeEach(async () => {
    // Clean up existing test data
    await TestOwner.dispose(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, 'testowner');

    // Create test owner using MockDataMachine
    machine = new MockDataMachine(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);
    await machine.initialize();
    const testOwnerState = await machine.createNewCluster('testowner', 'testpassword');
    testOwner = await testOwnerState.getUserOwnerByName('testowner');
  });

  testWrap('', 'should not throw when there are no namespaces created', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace`,
        testOwner.authHeaders()))
      .result((result => {
        expect(result).toEqual([]);
      }));
  });
});

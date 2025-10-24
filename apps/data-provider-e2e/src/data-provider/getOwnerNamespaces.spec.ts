import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { getOwnerNamespacesApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';

const api = getOwnerNamespacesApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  testWrap('', 'smoke', async () => {

    const mockDataMachine = await MockDataMachine2.createScenario(
      DATA_MOCKER_URL,
      BACKDOOR_USERNAME,
      BACKDOOR_PASSWORD,
      {
        owners: [
          { name: 'testowner' },
        ],
        namespaces: [
          {
            name: 'testnamespace1',
            creator: 'testowner',
            users: [],
            paymentEvents: [],
          },
          {
            name: 'testnamespace2',
            creator: 'testowner',
            users: [],
            paymentEvents: [],
          },
          {
            name: 'testnamespace3',
            creator: 'testowner',
            users: [],
            paymentEvents: [],
          },
        ],
      },
    );

    const testOwner = mockDataMachine.getOwner('testowner');

    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
    ));
  });
  it.todo('invalid owner key - does not match owner id');
  testWrap('', 'throws 401 with invalid token', async () => {

    const mockDataMachine = await MockDataMachine2.createScenario(
      DATA_MOCKER_URL,
      BACKDOOR_USERNAME,
      BACKDOOR_PASSWORD,
      {
        owners: [
          { name: 'testowner' },
        ],
        namespaces: [
          {
            name: 'testnamespace1',
            creator: 'testowner',
            users: [],
            paymentEvents: [],
          },
          {
            name: 'testnamespace2',
            creator: 'testowner',
            users: [],
            paymentEvents: [],
          },
          {
            name: 'testnamespace3',
            creator: 'testowner',
            users: [],
            paymentEvents: [],
          },
        ],
      },
    );

    const testOwner = mockDataMachine.getOwner('testowner');

    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
        {
          headers: {
            'Authorization': 'Bearer invalid',
          },
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  testWrap('', 'returns an namespaces for owner', async () => {

    const mockDataMachine = await MockDataMachine2.createScenario(
      DATA_MOCKER_URL,
      BACKDOOR_USERNAME,
      BACKDOOR_PASSWORD,
      {
        owners: [
          { name: 'testowner' },
        ],
        namespaces: [
          {
            name: 'testnamespace1',
            creator: 'testowner',
            users: [],
            paymentEvents: [],
          },
          {
            name: 'testnamespace2',
            creator: 'testowner',
            users: [],
            paymentEvents: [],
          },
          {
            name: 'testnamespace3',
            creator: 'testowner',
            users: [],
            paymentEvents: [],
          },
        ],
      },
    );

    const testOwner = mockDataMachine.getOwner('testowner');
    const namespace1 = mockDataMachine.getNamespace('testnamespace1');
    const namespace2 = mockDataMachine.getNamespace('testnamespace2');
    const namespace3 = mockDataMachine.getNamespace('testnamespace3');

    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
        await mockDataMachine.getAuthHeaders('testowner')))
      .result((result => {
        expect(result).toEqual([
          {
            avatarId: expect.any(Number),
            id: namespace1.id,
            name: 'testnamespace1',
          },
          {
            avatarId: expect.any(Number),
            id: namespace2.id,
            name: 'testnamespace2',
          },
          {
            avatarId: expect.any(Number),
            id: namespace3.id,
            name: 'testnamespace3',
          },
        ]);
      }));
  });
});

describe(API_NAME + ' bugs', () => {

  testWrap('', 'should not throw when there are no namespaces created', async () => {

    const mockDataMachine = await MockDataMachine2.createScenario(
      DATA_MOCKER_URL,
      BACKDOOR_USERNAME,
      BACKDOOR_PASSWORD,
      {
        owners: [
          { name: 'testowner' },
        ],
        namespaces: [],
      },
    );

    const testOwner = mockDataMachine.getOwner('testowner');

    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
        await mockDataMachine.getAuthHeaders('testowner')))
      .result((result => {
        expect(result).toEqual([]);
      }));
  });
});

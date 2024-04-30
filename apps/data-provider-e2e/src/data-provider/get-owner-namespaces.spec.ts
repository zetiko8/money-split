import axios from 'axios';
import { DATA_PROVIDER_URL, TestContext, fnCall, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { getOwnerNamespacesApi } from '@angular-monorepo/api-interface';

const api = getOwnerNamespacesApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaces!: { namespaceId: number }[];
  let testContext: TestContext;
  beforeEach(async () => {
    try {
      testContext = new TestContext();
      await testContext
        .deleteOwner('testowner');
      await testContext
        .deleteOwner('invitedowner');
      await testContext
        .registerOwner('testowner', 'testpassword');
      await testContext
        .createNamespace('testnamespace1');
      await testContext
        .createNamespace('testnamespace2');
      await testContext
        .createNamespace('testnamespace3');
      await testContext.login();

      namespaces = testContext.namespaces;
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  afterEach(async () => {
    try {
      await testContext.deleteNamespaces();
    } catch (error) {
      throw Error('afterEach error: ' + error.message);
    }
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/${testContext.ownerKey}/namespace`,
    ));
  });
  it.todo('invalid owner key - does not match owner id');
  it('throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testContext.ownerKey}/namespace`,
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testContext.ownerKey}/namespace`,
        {
          headers: {
            'Authorization': 'Bearer invalid',
          },
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it('returns an namespaces for owner', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${testContext.ownerKey}/namespace`,
        testContext.authHeaders()))
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
  it.todo('returns an empty array if there are no namespaces for owner');
});

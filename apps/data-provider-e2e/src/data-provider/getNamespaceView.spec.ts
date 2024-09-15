import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { getNamespaceViewApi } from '@angular-monorepo/api-interface';
import { TestOwner } from '@angular-monorepo/backdoor';

const api = getNamespaceViewApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let ownerKey!: string;
  let ownerKeyOtherOwner!: string;
  let testOwner!: TestOwner;
  let otherOwner!: TestOwner;
  let namespaceId!: number;
  beforeEach(async () => {
    testOwner = new TestOwner(
      DATA_PROVIDER_URL,
      'testowner',
      'testpassword',
    );
    await testOwner.dispose();
    await testOwner.register();
    otherOwner = new TestOwner(
      DATA_PROVIDER_URL,
      'otherOwner',
      'testpassword',
    );
    await otherOwner.dispose();
    await otherOwner.register();
    const namespace = await testOwner.createNamespace('testnamespace');
    namespaceId = namespace.id;
    ownerKey = testOwner.owner.key;
    ownerKeyOtherOwner = otherOwner.owner.key;
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
        testOwner.authHeaders(),
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it('namespace does not exist', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/20000000`,
        testOwner.authHeaders(),
      ))
      .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
  });
  it('returns a namespace view', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}`,
        testOwner.authHeaders(),
      ))
      .result((result => {
        expect(result).toEqual(    {
          id: namespaceId,
          name: 'testnamespace',
          invitations: [],
          users: [
            {
              id: expect.any(Number),
              name: testOwner.owner.username,
              namespaceId: namespaceId,
              ownerId: testOwner.owner.id,
              avatarId: expect.any(Number),
            },
          ],
          ownerUsers: [
            {
              id: expect.any(Number),
              name: testOwner.owner.username,
              namespaceId: namespaceId,
              ownerId: testOwner.owner.id,
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

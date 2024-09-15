import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { TestOwner } from '@angular-monorepo/backdoor';
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

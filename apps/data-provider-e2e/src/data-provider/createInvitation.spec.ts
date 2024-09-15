import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, queryDb, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { createInvitationApi } from '@angular-monorepo/api-interface';
import { TestOwner } from '@angular-monorepo/backdoor';

const api = createInvitationApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let testOwner!: TestOwner;
  let otherOwner!: TestOwner;
  let namespaceId!: number;
  let ownerKey!: string;
  let ownerId!: number;
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
    const namespace = await testOwner.createNamespace('testnamespace1');
    namespaceId = namespace.id;
    ownerKey = testOwner.owner.key;
    ownerId = testOwner.owner.id;
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
    ));
  });
  it('requires email to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
        {},
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('requires email to be a string', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
        {
          email: 2,
        },
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it.todo('requires email to be a valid email');
  it('throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
        {},
        {
          headers: {
            'Authorization': 'Bearer invalid',
          },
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it.todo('throws 401 with invalid ownerKey');
  it('returns an invitation', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
        {
          email: 'test.email@test.com',
        },
        testOwner.authHeaders(),
      ))
      .result((result => {
        expect(result).toEqual({
          namespaceId: namespaceId,
          accepted: false,
          rejected: false,
          id: expect.any(Number),
          email: 'test.email@test.com',
          created: expect.any(String),
          edited: expect.any(String),
          createdBy: ownerId,
          editedBy: ownerId,
          invitationKey: expect.any(String),
        });
      }));
  });
  it('can not invite same email twice', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
        {
          email: 'test.email@test.com',
        },
        testOwner.authHeaders(),
      ))
      .result((() => {}));
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
        {
          email: 'test.email@test.com',
        },
        testOwner.authHeaders(),
      )).throwsError('RESOURCE_ALREADY_EXISTS');
  });
  it.todo('sends an invitation email');
  describe('dbState', () => {
    let invitationId!: number;
    beforeEach(async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          testOwner.authHeaders(),
        ))
        .result((async res => {
          invitationId = res.id;
        }));
    });
    it('saves invitation in the db', async () => {
      const response = await queryDb(
        `
        SELECT * FROM Invitation
        WHERE id = ${invitationId}
        `,
      );
      expect(response[0]).toEqual({
        namespaceId: namespaceId,
        accepted: 0,
        rejected: 0,
        id: expect.any(Number),
        email: 'test.email@test.com',
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: ownerId,
        editedBy: ownerId,
        invitationKey: expect.any(String),
      });
      expect(response).toHaveLength(1);
    });
  });
});

import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_PROVIDER_URL, fnCall, queryDb, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { createInvitationApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';

const api = createInvitationApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('','should handle basic invitation request', async () => {
      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;

      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
      ));
    });
  });

  describe('validation', () => {
    testWrap('', 'requires email to be provided', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {},
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'requires email to be a string', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 2,
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    it.todo('requires email to be a valid email');

    testWrap('', 'throws 401 with invalid token', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;

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

    testWrap('', 'can not invite same email twice', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await machine.getAuthHeaders('creator-owner'),
        ))
        .result((() => void 0));
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await machine.getAuthHeaders('creator-owner'),
        )).throwsError(ERROR_CODE.RESOURCE_ALREADY_EXISTS);
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns an invitation', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;
      const ownerId = machine.getOwner('creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await machine.getAuthHeaders('creator-owner'),
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

    it.todo('sends an invitation email');
  });

  describe('dbState', () => {
    let invitationId!: number;
    let namespaceId!: number;
    let ownerId!: number;
    beforeEach(async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      namespaceId = machine.getNamespace('namespace1').id;
      ownerId = machine.getOwner('creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await machine.getAuthHeaders('creator-owner'),
        ))
        .result((async (res: { id: number }) => {
          invitationId = res.id;
        }));
    });
    it('saves invitation in the db', async () => {
      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
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

  describe.only('fixed bugs', () => {
    testWrap('.only', 'invitation key is not an empty string', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');
      await machine.createOwner('namespace-owner2');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await machine.getAuthHeaders('creator-owner'),
        ))
        .result((result => {
          expect(result.invitationKey).not.toEqual('');
        }));
    });
  });
});

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

    testWrap('', 'requires email to be a valid email', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.emailtest.com',
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'requires email to not be longer than 65 (limit of express validator) characters', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'a'.repeat(65) + '@test.com',
          },
          await machine.getAuthHeaders('creator-owner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'throws when owner key is not found', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');

      const namespaceId = machine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${'not-found-owner-key'}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await machine.getAuthHeaders('creator-owner'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'throws when owner key is not from the owner', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');

      const namespaceOwner1Key = machine.getOwner('namespace-owner1').key;
      const namespaceId = machine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${namespaceOwner1Key}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await machine.getAuthHeaders('creator-owner'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'throws when namespace is not from the owner', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');
      await machine.createNamespace('namespace-owner1', 'namespace2');

      const ownerKey = machine.getOwner('creator-owner').key;
      const otherNamespaceId = machine.getNamespace('namespace2').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${otherNamespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await machine.getAuthHeaders('creator-owner'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'throws 401 with invalid token', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.emailtest.com',
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.emailtest.com',
          },
          {
            headers: {
              'Authorization': 'Bearer invalid',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'can not invite same email twice', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

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

    testWrap('', 'email can be 64 + 9 characters long', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'a'.repeat(64) + '@test.com',
          },
          await machine.getAuthHeaders('creator-owner')))
        .result(() => void 0);
    });

    it.todo('sends an invitation email');
  });

  describe('dbState', () => {
    testWrap('', 'saves invitation in the db', async () => {
      let invitationId!: number;

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

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
        .result((async (res: { id: number }) => {
          invitationId = res.id;
        }));

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

    testWrap('', 'email is trimmed', async () => {
      let invitationId!: number;

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

      await machine.createNamespace('creator-owner', 'namespace1');

      const ownerKey = machine.getOwner('creator-owner').key;
      const namespaceId = machine.getNamespace('namespace1').id;
      const ownerId = machine.getOwner('creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: '  test.email@test.com  ',
          },
          await machine.getAuthHeaders('creator-owner'),
        ))
        .result((async (res: { id: number }) => {
          invitationId = res.id;
        }));

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

  describe('fixed bugs', () => {
    testWrap('', 'invitation key is not an empty string', async () => {

      const machine = new MockDataMachine2(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      await machine.createOwner('creator-owner');
      await machine.createOwner('namespace-owner1');

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

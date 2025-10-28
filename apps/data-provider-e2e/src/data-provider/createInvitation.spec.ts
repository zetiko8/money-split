import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, queryDb, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { createInvitationApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';

const api = createInvitationApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('','should handle basic invitation request', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
      ));
    });
  });

  describe('validation', () => {
    testWrap('', 'requires email to be provided', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {},
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError('EMAIL');
    });

    testWrap('', 'requires email to be a string', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 2,
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError('EMAIL');
    });

    testWrap('', 'requires email to be a valid email', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.emailtest.com',
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError('EMAIL');
    });

    testWrap('', 'requires email to not be longer than 65 (limit of express validator) characters', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'a'.repeat(65) + '@test.com',
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .throwsError('EMAIL_MAX_LENGTH');
    });

    testWrap('', 'throws when owner key is not found', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${'not-found-owner-key'}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await mockDataMachine.getAuthHeaders('creator-owner'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'throws when owner key is not from the owner', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespaceOwner1Key = mockDataMachine.getOwner('namespace-owner1').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${namespaceOwner1Key}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await mockDataMachine.getAuthHeaders('creator-owner'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'throws when namespace is not from the owner', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
            { name: 'namespace-owner1' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
            {
              name: 'namespace2',
              creator: 'namespace-owner1',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const otherNamespaceId = mockDataMachine.getNamespace('namespace2').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${otherNamespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await mockDataMachine.getAuthHeaders('creator-owner'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'throws 401 with invalid token', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

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
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await mockDataMachine.getAuthHeaders('creator-owner'),
        ))
        .result((() => void 0));
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await mockDataMachine.getAuthHeaders('creator-owner'),
        )).throwsError(ERROR_CODE.RESOURCE_ALREADY_EXISTS);
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns an invitation', async () => {
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const ownerId = mockDataMachine.getOwner('creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await mockDataMachine.getAuthHeaders('creator-owner'),
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
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'a'.repeat(64) + '@test.com',
          },
          await mockDataMachine.getAuthHeaders('creator-owner')))
        .result(() => void 0);
    });

    it.todo('sends an invitation email');
  });

  describe('dbState', () => {
    testWrap('', 'saves invitation in the db', async () => {
      let invitationId!: number;

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const ownerId = mockDataMachine.getOwner('creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await mockDataMachine.getAuthHeaders('creator-owner'),
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

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;
      const ownerId = mockDataMachine.getOwner('creator-owner').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: '  test.email@test.com  ',
          },
          await mockDataMachine.getAuthHeaders('creator-owner'),
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
      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator-owner' },
          ],
          namespaces: [
            {
              name: 'namespace1',
              creator: 'creator-owner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const ownerKey = mockDataMachine.getOwner('creator-owner').key;
      const namespaceId = mockDataMachine.getNamespace('namespace1').id;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
          {
            email: 'test.email@test.com',
          },
          await mockDataMachine.getAuthHeaders('creator-owner'),
        ))
        .result((result => {
          expect(result.invitationKey).not.toEqual('');
        }));
    });
  });
});

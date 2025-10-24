import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, expectEqual, fnCall, queryDb, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';
import { createNamespaceApi } from '@angular-monorepo/api-interface';

const api = createNamespaceApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('', 'should handle basic namespace creation', async () => {

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

      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
        {
          namespaceName: 'testnamespace',
          avatarColor: 'green',
        },
        await mockDataMachine.getAuthHeaders('testowner'),
      ));
    });
  });

  describe('validation', () => {
    testWrap('', 'requires namespaceName to be provided', async () => {

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
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            avatarUrl: 'http://url.com',
          },
          await mockDataMachine.getAuthHeaders('testowner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            avatarUrl: 'http://url.com',
            namespaceName: '  ',
          },
          await mockDataMachine.getAuthHeaders('testowner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'requires either avatarUrl or avatarColor to be provided', async () => {

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
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
          },
          await mockDataMachine.getAuthHeaders('testowner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });

    testWrap('', 'throws 401 with invalid token', async () => {

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
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
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
  });

  describe('happy path', () => {
    testWrap('', 'returns a namespace', async () => {

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
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((result => {
          expect(result).toHaveProperty('avatarId');
          expect(typeof result.avatarId).toBe('number');
          expect(result).toHaveProperty('id');
          expect(typeof result.id).toBe('number');
          expect(result).toHaveProperty('name');
          expect(typeof result.name).toBe('string');
        }));
    });

    testWrap('', 'trims the namespace name', async () => {

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
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            namespaceName: '  testnamespace  ',
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((result => {
          expect(result.name).toBe('testnamespace');
        }));
    });
    testWrap('', 'can not have two namespaces with same name', async () => {

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
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((() => void 0));
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        )).throwsError(ERROR_CODE.RESOURCE_ALREADY_EXISTS);
    });
  });

  describe('db state', () => {
    testWrap('', 'saves namespace in the db', async () => {

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

      let namespaceId!: number;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((async res => {
          namespaceId = res.id;
        }));

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM Namespace
        WHERE id = ${namespaceId}
        `,
      );
      expectEqual(
        { id: namespaceId, name: 'testnamespace', avatarId: '_type_number_' },
        response[0],
      );
      expect(response).toHaveLength(1);
    });
    testWrap('', 'saves namespace avatar in db', async () => {

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

      let avatarId!: number;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((async res => {
          avatarId = res.avatarId;
        }));

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM Avatar
        WHERE id = ${avatarId}
        `,
      );
      expectEqual(
        { id: avatarId, color: 'green', dataUrl: null, url: null },
        response[0],
      );
      expect(response).toHaveLength(1);
    });
    testWrap('', 'adds owner to namespace', async () => {

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

      let namespaceId!: number;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((async res => {
          namespaceId = res.id;
        }));

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM NamespaceOwner
        WHERE namespaceId = ${namespaceId}
        AND ownerId = ${testOwner.id}
        `,
      );
      expectEqual(
        { ownerId: testOwner.id, namespaceId },
        response[0],
      );
      expect(response).toHaveLength(1);
    });
    testWrap('', 'adds user to namespace', async () => {

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

      let namespaceId!: number;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            namespaceName: 'testnamespace',
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((async res => {
          namespaceId = res.id;
        }));

      const users = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM \`User\`
        WHERE namespaceId = ${namespaceId}
        AND name = '${testOwner.username}'
        `,
      );
      expect(users).toHaveLength(1);
      expectEqual(
        {
          id: '_type_number_',
          name: testOwner.username,
          namespaceId: namespaceId,
          ownerId: testOwner.id,
          avatarId: testOwner.avatarId,
        },
        users[0],
      );
    });
  });
  describe('db state - triming', () => {
    testWrap('', 'trims the namespace name', async () => {

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

      let namespaceId!: number;

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace`,
          {
            namespaceName: '  testnamespace  ',
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((async res => {
          namespaceId = res.id;
        }));

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM Namespace
        WHERE id = ${namespaceId}
        `,
      );
      expect(response[0].name).toEqual('testnamespace');
    });
  });
});

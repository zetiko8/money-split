import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, queryDb, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';
import { editNamespaceSettingApi } from '@angular-monorepo/api-interface';

const api = editNamespaceSettingApi();
const API_NAME = api.ajax.method + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('', 'should handle basic namespace settings update', async () => {

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
              name: 'originalnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('originalnamespace');

      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
        {
          namespaceName: 'newnamespace',
          avatarColor: 'blue',
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
          namespaces: [
            {
              name: 'originalnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('originalnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
          {
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
          {
            namespaceName: '  ',
            avatarColor: 'green',
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
          namespaces: [
            {
              name: 'originalnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('originalnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
          {
            namespaceName: 'newnamespace',
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
          namespaces: [
            {
              name: 'originalnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('originalnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
          {},
          {
            headers: {
              'Authorization': 'Bearer invalid',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'throws 401 with invalid ownerKey', async () => {

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
              name: 'originalnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespace = mockDataMachine.getNamespace('originalnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invalid/namespace/${namespace.id}/settings`,
          {
            namespaceName: 'newnamespace',
            avatarColor: 'blue',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'can not change to a duplicate namespace name', async () => {

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
              name: 'originalnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
            {
              name: 'duplicatename',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('originalnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
          {
            namespaceName: 'duplicatename',
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .throwsError(ERROR_CODE.RESOURCE_ALREADY_EXISTS);
    });

  });

  describe('happy path', () => {
    testWrap('', 'returns updated namespace settings', async () => {

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
              name: 'originalnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('originalnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
          {
            namespaceName: 'updatednamespace',
            avatarColor: 'red',
            avatarUrl: 'my//url',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((result => {
          expect(result).toEqual({
            avatarColor: 'red',
            avatarImage: null,
            avatarUrl: 'my//url',
            namespaceName: 'updatednamespace',
          });
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
          namespaces: [
            {
              name: 'originalnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('originalnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
          {
            namespaceName: '  changedNamespace name  ',
            avatarColor: 'green',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((result => {
          expect(result.namespaceName).toBe('changedNamespace name');
        }));
    });

    testWrap('', 'can leave everything the name as it is', async () => {

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
              name: 'originalnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('originalnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
          {
            namespaceName: 'originalnamespace',
            avatarColor: 'red',
            avatarUrl: 'my//url',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((result => {
          expect(result).toEqual({
            avatarColor: 'red',
            avatarImage: null,
            avatarUrl: 'my//url',
            namespaceName: 'originalnamespace',
          });
        }));
    });
  });

  describe('db state', () => {
    testWrap('', 'updates namespace in the db', async () => {

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
              name: 'originalnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('originalnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
          {
            namespaceName: 'dbtestnamespace',
            avatarColor: 'yellow',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result(() => void 0);

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM Namespace
        WHERE id = ${namespace.id}
        `,
      );
      expect(response[0]).toEqual({
        id: namespace.id,
        avatarId: expect.any(Number),
        name: 'dbtestnamespace',
      });
    });
    testWrap('', 'updates namespace avatar in db', async () => {

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
              name: 'originalnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('originalnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
          {
            namespaceName: 'dbtestnamespace',
            avatarColor: 'yellow',
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result(() => void 0);

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT a.* FROM Avatar a
        LEFT JOIN Namespace n
        ON a.id = n.avatarId
        WHERE n.id = ${namespace.id}
        `,
      );

      expect(response[0]).toEqual({
        id: expect.any(Number),
        color: 'yellow',
        dataUrl: null,
        url: null,
      });
    });

    describe('triming', () => {
      testWrap('', 'trims the namespace name', async () => {

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
                name: 'originalnamespace',
                creator: 'testowner',
                users: [],
                paymentEvents: [],
              },
            ],
          },
        );

        const testOwner = mockDataMachine.getOwner('testowner');
        const namespace = mockDataMachine.getNamespace('originalnamespace');

        let newNamespaceId!: number;

        await fnCall(API_NAME,
          async () => await axios.post(
            `${DATA_PROVIDER_URL}/app/${testOwner.key}/namespace/${namespace.id}/settings`,
            {
              namespaceName: '  testnamespace  ',
              avatarColor: 'green',
            },
            await mockDataMachine.getAuthHeaders('testowner'),
          ))
          .result((async () => {
            newNamespaceId = namespace.id;
          }));

        const response = await queryDb(
          BACKDOOR_USERNAME,
          BACKDOOR_PASSWORD,
          `
          SELECT * FROM Namespace
          WHERE id = ${newNamespaceId}
          `,
        );
        expect(response[0].name).toEqual('testnamespace');
      });
    });
  });
});


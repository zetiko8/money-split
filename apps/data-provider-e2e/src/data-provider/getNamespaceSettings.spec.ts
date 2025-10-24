import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE, MNamespaceSettings } from '@angular-monorepo/entities';
import { getNamespaceSettingsApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';

const api = getNamespaceSettingsApi();
const API_NAME = api.ajax.method + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('', 'smoke', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const creator = mockDataMachine.getOwner('creator');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${creator.key}/namespace/${namespace.id}/settings`));
    });
  });

  describe('validation', () => {
    testWrap('', 'throws 401 with invalid token', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const creator = mockDataMachine.getOwner('creator');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creator.key}/namespace/${namespace.id}/settings`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creator.key}/namespace/${namespace.id}/settings`,
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
            { name: 'creator' },
            { name: 'otherowner' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const otherOwner = mockDataMachine.getOwner('otherowner');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${otherOwner.key}/namespace/${namespace.id}/settings`,
          await mockDataMachine.getAuthHeaders('creator'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    testWrap('', 'namespace does not exist', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const creator = mockDataMachine.getOwner('creator');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creator.key}/namespace/20000000/settings`,
          await mockDataMachine.getAuthHeaders('creator'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns namespace settings', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const creator = mockDataMachine.getOwner('creator');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creator.key}/namespace/${namespace.id}/settings`,
          await mockDataMachine.getAuthHeaders('creator'),
        ))
        .result((result: MNamespaceSettings) => {
          expect(result).toEqual({
            avatarColor: expect.any(String),
            avatarImage: null,
            avatarUrl: null,
            namespaceName: 'testnamespace',
          });
        });
    });
  });
});



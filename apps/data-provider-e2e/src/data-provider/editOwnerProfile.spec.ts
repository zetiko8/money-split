import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';
import { editOwnerProfileApi } from '@angular-monorepo/api-interface';
import { getRandomColor } from '@angular-monorepo/utils';

const api = editOwnerProfileApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('', 'smoke', async () => {

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
              name: 'testnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');

      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.key}/profile`));
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
            { name: 'testowner' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/profile`,
          {
            ownerAvatar: {
              avatarColor: '#FFFH',
              avatarUrl: null,
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/profile`,
          {
            ownerAvatar: {
              avatarColor: '#FFFH',
              avatarUrl: null,
            },
          },
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
            { name: 'otherowner' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const otherOwner = mockDataMachine.getOwner('otherowner');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${otherOwner.key}/profile`,
          {
            ownerAvatar: {
              avatarColor: '#FFFH',
              avatarUrl: null,
            },
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
  });

  describe('happy path', () => {
    testWrap('', 'returns an owner profile view', async () => {

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
              name: 'testnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/profile`,
          {
            ownerAvatar: {
              avatarColor: getRandomColor(),
              avatarUrl: null,
            },
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((result => {
          expect(result).toEqual({
            avatar: {
              id: expect.any(Number),
              color: expect.any(String),
              url: null,
            },
            owner: {
              key: testOwner.key,
              id: testOwner.id,
              username: testOwner.username,
              avatarId: expect.any(Number),
            },
            users: [
              {
                user: {
                  id: expect.any(Number),
                  name: testOwner.username,
                  namespaceId: namespace.id,
                  ownerId: testOwner.id,
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

    testWrap('', 'updates url and color', async () => {

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
              name: 'testnamespace',
              creator: 'testowner',
              users: [],
              paymentEvents: [],
            },
          ],
        },
      );

      const testOwner = mockDataMachine.getOwner('testowner');
      const namespace = mockDataMachine.getNamespace('testnamespace');

      const newColor = getRandomColor();
      const newUrl = 'https://example.com';
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.key}/profile`,
          {
            ownerAvatar: {
              avatarColor: newColor,
              avatarUrl: newUrl,
            },
          },
          await mockDataMachine.getAuthHeaders('testowner'),
        ))
        .result((result => {
          expect(result).toEqual({
            avatar: {
              id: expect.any(Number),
              color: newColor,
              url: newUrl,
            },
            owner: {
              key: testOwner.key,
              id: testOwner.id,
              username: testOwner.username,
              avatarId: expect.any(Number),
            },
            users: [
              {
                user: {
                  id: expect.any(Number),
                  name: testOwner.username,
                  namespaceId: namespace.id,
                  ownerId: testOwner.id,
                  avatarId: expect.any(Number),
                },
                avatar: {
                  id: expect.any(Number),
                  color: newColor,
                  url: newUrl,
                },
              },
            ],
          });
        }));
    });
  });
});

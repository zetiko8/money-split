import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { getViewUserApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';

const api = getViewUserApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  testWrap('', 'smoke', async () => {
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
            users: [
              { name: 'namespace-owner1', invitor: 'creator-owner' },
            ],
            paymentEvents: [],
          },
        ],
      },
    );

    const ownerKey = mockDataMachine.getOwner('creator-owner').key;
    const namespaceId = mockDataMachine.getNamespace('namespace1').id;
    const userId = mockDataMachine.getNamespaceUser('namespace1', 'namespace-owner1').id;

    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/user/${userId}`));
  });
  testWrap('', 'throws 401 with invalid token', async () => {
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
            users: [
              { name: 'namespace-owner1', invitor: 'creator-owner' },
            ],
            paymentEvents: [],
          },
        ],
      },
    );

    const ownerKey = mockDataMachine.getOwner('creator-owner').key;
    const namespaceId = mockDataMachine.getNamespace('namespace1').id;
    const userId = mockDataMachine.getNamespaceUser('namespace1', 'namespace-owner1').id;

    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/user/${userId}`,
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/user/${userId}`,
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
          { name: 'creator-owner' },
          { name: 'namespace-owner1' },
        ],
        namespaces: [
          {
            name: 'namespace1',
            creator: 'creator-owner',
            users: [
              { name: 'namespace-owner1', invitor: 'creator-owner' },
            ],
            paymentEvents: [],
          },
        ],
      },
    );

    const ownerKeyOtherOwner = mockDataMachine.getOwner('namespace-owner1').key;
    const namespaceId = mockDataMachine.getNamespace('namespace1').id;
    const userId = mockDataMachine.getNamespaceUser('namespace1', 'namespace-owner1').id;

    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKeyOtherOwner}/namespace/${namespaceId}/user/${userId}`,
        await mockDataMachine.getAuthHeaders('creator-owner'),
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it.todo('throws 401 with namespace that does not belong to a owner');
  it.todo('throws 401 with user that does not belong to a namespace');
  it.todo('namespace does not exist',
    // async () => {
    //   await fnCall(API_NAME,
    //     async () => await axios.get(
    //       `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/20000000/user/${userId}`,
    //       creatorOwner.authHeaders(),
    //     ))
    //     .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    // }
  );
  it.todo('user does not exist');
  testWrap('', 'returns user data view', async () => {
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
            users: [
              { name: 'namespace-owner1', invitor: 'creator-owner' },
            ],
            paymentEvents: [],
          },
        ],
      },
    );

    const ownerKey = mockDataMachine.getOwner('creator-owner').key;
    const namespaceId = mockDataMachine.getNamespace('namespace1').id;
    const userId = mockDataMachine.getNamespaceUser('namespace1', 'namespace-owner1').id;
    const user = mockDataMachine.getNamespaceUser('namespace1', 'namespace-owner1');
    const namespace = mockDataMachine.getNamespace('namespace1');

    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/user/${userId}`,
        await mockDataMachine.getAuthHeaders('creator-owner'),
      ))
      .result((result => {
        expect(result).toEqual({
          user: {
            avatarId: expect.any(Number),
            name: user.name,
            namespaceId,
            ownerId: user.ownerId,
            id: user.id,
          },
          namespace: {
            avatarId: expect.any(Number),
            name: namespace.name,
            id: namespaceId,
          },
        });
      }));
  });

});

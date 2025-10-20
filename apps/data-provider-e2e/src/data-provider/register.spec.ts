import axios from 'axios';
import { BACKDOOR_USERNAME, BACKDOOR_PASSWORD, DATA_PROVIDER_URL, fnCall, queryDb, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { registerApi } from '@angular-monorepo/api-interface';
import { TestOwner } from '@angular-monorepo/backdoor';

const api = registerApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  beforeEach(async () => {
    try {
      await TestOwner.dispose(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, 'testusername');
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  testWrap('', 'smoke', async () => {
    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/register`,
    ));
  });
  testWrap('', 'requires body to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/register`,
        {}))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  testWrap('', 'requires username to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/register`,
        {
          password: 'testpassword',
          avatarUrl: 'http:test.com',
          avatarColor: 'color',
        }))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  [3, null, [], {}].forEach(value => {
    testWrap('', 'requires username to be string but is ' + value, async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/register`,
          {
            username: value,
            password: 'testpassword',
            avatarUrl: 'http:test.com',
            avatarColor: 'color',
          }))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
  });
  testWrap('', 'requires password to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/register`,
        {
          username: 'testusername',
          avatarUrl: 'http:test.com',
          avatarColor: 'color',
        }))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  [3, null, [], {}].forEach(value => {
    testWrap('', 'requires password to be string but is ' + value, async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/register`,
          {
            username: 'testusername',
            password: value,
            avatarUrl: 'http:test.com',
            avatarColor: 'color',
          }))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
  });
  [3, [], {}].forEach(value => {
    testWrap('', 'requires avatarUrl to be string but is ' + value, async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/register`,
          {
            username: 'testusername',
            password: 'testpassword',
            avatarUrl: value,
            avatarColor: 'color',
          }))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
  });
  [3, [], {}].forEach(value => {
    testWrap('', 'requires avatarUrl to be string but is ' + value, async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/register`,
          {
            username: 'testusername',
            password: 'testpassword',
            avatarUrl: 'http:test.com',
            avatarColor: value,
          }))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
  });
  testWrap('', 'requires either avatarUrl or avatarColor to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/register`,
        {
          username: 'testusername',
          password: 'testpassword',
        }))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it.todo('requires password to be a valid password');
  testWrap('', 'returns an owner', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/register`,
        {
          username: 'testusername',
          password: 'testpassword',
          avatarUrl: 'http:test.com',
          avatarColor: 'color',
        }))
      .result((result => {
        expect(result).toEqual({
          avatarId: expect.any(Number),
          id: expect.any(Number),
          key: expect.any(String),
          username: 'testusername',
        });
      }));
  });
  testWrap('', 'can not register with same username twice', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/register`,
        {
          username: 'testusername',
          password: 'testpassword',
          avatarUrl: 'http:test.com',
          avatarColor: 'color',
        }),
    ).throwsError('OWNER_USERNAME_ALREADY_EXISTS');
  });

  testWrap('', 'trims the username', async () => {
    let ownerId: string;
    // Should save trimmed username
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/register`,
        {
          username: '   testusername   ',
          password: 'testpassword',
          avatarUrl: 'http:test.com',
          avatarColor: 'color',
        }))
      .result((result => {
        expect(result.username).toBe('testusername');
        ownerId = result.id;
      }));

    const response = await queryDb(
      BACKDOOR_USERNAME,
      BACKDOOR_PASSWORD,
      `
        SELECT * FROM Owner
        WHERE id = ${ownerId}
        `,
    );
    expect(response[0].username).toEqual('testusername');

    // Should not allow username with only spaces
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/register`,
        {
          username: '   ',
          password: 'testpassword',
          avatarUrl: 'http:test.com',
          avatarColor: 'color',
        }))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });

  describe('dbState', () => {
    let ownerId!: number;
    let ownerAvatarId!: number;
    beforeEach(async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/register`,
          {
            username: 'testusername',
            password: 'testpassword',
            avatarUrl: 'http:test.com',
            avatarColor: 'color',
          }))
        .result((result => {
          ownerId = result.id;
          ownerAvatarId = result.avatarId;
        }));
    });
    testWrap('', 'saves owner in the db', async () => {
      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM Owner
        WHERE id = ${ownerId}
        `,
      );
      expect(response[0]).toEqual({
        avatarId: ownerAvatarId,
        id: ownerId,
        key: expect.any(String),
        username: 'testusername',
        hash: expect.any(String),
      });
      expect(response).toHaveLength(1);
    });
    testWrap('', 'saves owner avatar in db', async () => {
      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM Avatar
        WHERE id = ${ownerAvatarId}
        `,
      );
      expect(response[0]).toEqual({
        dataUrl: null,
        id: ownerAvatarId,
        url: 'http:test.com',
        color: 'color',
      });
      expect(response).toHaveLength(1);
    });
  });
});

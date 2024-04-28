import axios from 'axios';
import { DATA_PROVIDER_URL, TestContext, fnCall, queryDb, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { registerApi } from '@angular-monorepo/api-interface';

const api = registerApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  beforeEach(async () => {
    try {
      const testContext = new TestContext();
      await testContext.deleteOwner('testusername');
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  it('a', () => {});
  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/register`,
    ));
  });
  it('requires body to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/register`,
        {}))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('requires username to be provided', async () => {
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
    it('requires username to be string but is ' + value, async () => {
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
  it('requires password to be provided', async () => {
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
    it('requires password to be string but is ' + value, async () => {
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
    it('requires avatarUrl to be string but is ' + value, async () => {
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
    it('requires avatarUrl to be string but is ' + value, async () => {
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
  it('requires either avatarUrl or avatarColor', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/register`,
        {
          username: 'testusername',
          password: 'testpassword',
          avatarUrl: 'http:test.com',
        }))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/register`,
        {
          username: 'testusername',
          password: 'testpassword',
          avatarColor: 'color',
        }))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it.todo('requires password to be a valid password');
  it('returns an owner', async () => {
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
  it('username must be unique', async () => {
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
    it('saves owner in the db', async () => {
      const response = await queryDb(
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
    it('saves avatar in the db', async () => {
      const response = await queryDb(
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

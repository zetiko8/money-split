import axios from 'axios';
import { fnCall, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { BACKDOOR_ACTIONS } from '@angular-monorepo/backdoor';

const DATA_PROVIDER_URL = 'http://localhost:3333/data-provider';
const API_NAME = '/login';

describe(API_NAME, () => {

  beforeAll(async () => {
    try {
      await BACKDOOR_ACTIONS.deleteOwner(
        DATA_PROVIDER_URL,
        'testusername',
      );

    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }

    try {
      await BACKDOOR_ACTIONS.registerOwner(
        DATA_PROVIDER_URL,
        'testusername',
        'testpassword',
      );

    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  afterAll(async () => {
    try {
      await BACKDOOR_ACTIONS.deleteOwner(
        DATA_PROVIDER_URL,
        'testusername',
      );

    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/login`));
  });
  it('requires username and password to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/login`))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/login`,
        {},
      ))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/login`,
        { username: 'testusername' },
      ))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/login`,
        { password: 'testpassword' },
      ))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('throws 401 with invalid credentials', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/login`,
        {
          username: 'invalidtestusername',
          password: 'testpassword',
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/login`,
        {
          username: 'testusername',
          password: 'invalidtestpassword',
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/login`,
        {
          username: 'invalidtestusername',
          password: 'invalidtestpassword',
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it('returns a token', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/login`,
        {
          username: 'testusername',
          password: 'testpassword',
        },
      ))
      .result((result => {
        expect(result).toHaveProperty('token');
        expect(typeof result.token).toBe('string');
        expect(result.token.length).toBeGreaterThan(0);
      }));
  });
});

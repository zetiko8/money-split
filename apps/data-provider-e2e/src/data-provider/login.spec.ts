import axios from 'axios';
import { fnCall, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { TestOwner } from '@angular-monorepo/backdoor';

const DATA_PROVIDER_URL = 'http://localhost:3333/data-provider';
const API_NAME = '/login';

describe(API_NAME, () => {

  beforeAll(async () => {
    const testOwner = new TestOwner(
      DATA_PROVIDER_URL,
      'testusername',
      'testpassword',
    );
    await testOwner.dispose();
    await testOwner.register();
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

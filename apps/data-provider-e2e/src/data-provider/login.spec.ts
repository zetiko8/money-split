import axios from 'axios';
import { fnCall, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { MockDataMachine } from '@angular-monorepo/backdoor';

const DATA_PROVIDER_URL = 'http://localhost:3333/data-provider';
const API_NAME = '/login';

describe(API_NAME, () => {
  let machine!: MockDataMachine;

  beforeAll(async () => {
    // Clean up existing test data
    await MockDataMachine.dispose(DATA_PROVIDER_URL, 'testusername');

    // Create test owner using MockDataMachine
    machine = new MockDataMachine(DATA_PROVIDER_URL);
    await machine.initialize();
    await machine.createNewCluster('testusername', 'testpassword');
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

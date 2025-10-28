import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';

const API_NAME = '/login';

describe(API_NAME, () => {

  testWrap('', 'smoke', async () => {
    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/login`));
  });
  testWrap('', 'requires username and password to be provided', async () => {
    // No scenario needed - testing validation only
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
  testWrap('', 'throws 401 with invalid credentials', async () => {

    await MockDataMachine2.createScenario(
      DATA_MOCKER_URL,
      BACKDOOR_USERNAME,
      BACKDOOR_PASSWORD,
      {
        owners: [
          { name: 'testusername' },
        ],
        namespaces: [],
      },
    );

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
  testWrap('', 'returns a token', async () => {

    await MockDataMachine2.createScenario(
      DATA_MOCKER_URL,
      BACKDOOR_USERNAME,
      BACKDOOR_PASSWORD,
      {
        owners: [
          { name: 'testusername' },
        ],
        namespaces: [],
      },
    );

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

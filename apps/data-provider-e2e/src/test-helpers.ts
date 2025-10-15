import { TestOwner } from '@angular-monorepo/backdoor';
import { AxiosError, AxiosResponse } from 'axios';

export const DATA_PROVIDER_URL = process.env.MIDDLEWARE_URL;

export const BACKDOOR_USERNAME = 'admin';
export const BACKDOOR_PASSWORD = process.env.ADMIN_PASSWORD;

export function testEnv () {
  return {
    DATA_PROVIDER_URL,
    BACKDOOR_USERNAME,
    BACKDOOR_PASSWORD,
  };
}

export function expectDate (dateString: string | Date) {
  return new Date(dateString).toISOString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throwBeforeEachError (error: any) {
  const begining = 'Before each error';
  try {
    if (!error) throw Error(`${begining}: Error object is empty`);
    if (error.config) {
      const err = error as AxiosError;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataError = (err.response.data as any).error;
      if (err.response) throw Error(`${begining}: ${err.message} : ${dataError}`);
    }
    if (error.message) throw Error(`${begining}: ${error.message}`);
  } catch (error) {
    if (error.message) throw Error(`${begining}: ${error.message}`);
  }

}

export async function smoke (
  apiName: string,
  apiCall: () => Promise<AxiosResponse>,
) {
  try {
    await apiCall();
  } catch (error) {
    const err = error as AxiosError;
    if (err.message === 'Request failed with status code 404')
      throw Error(`${apiName} 404`);

    if (err.response?.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(err.response.data as any).error)
        throw Error(`${apiName} failed`);
    }
  }
}

export function fnCall (
  apiName: string,
  apiCall: () => Promise<AxiosResponse>,
) {
  return {
    async throwsError (error: string) {
      let errorCode: string | null = null;

      try {
        await apiCall();
      } catch (error) {
        const err = error as AxiosError;
        if (err.message === 'Request failed with status code 404')
          throw Error(`${apiName} 404`);

        if (err.response?.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((err.response.data as any).error)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            errorCode = (err.response.data as any).error as string;
        }
      }

      if (errorCode === null)
        throw Error('Expected error to have been thrown');

      expect(errorCode).toBe(error);
    },
    async throwsNoError () {
      try {
        await apiCall();
      } catch (error) {
        throw Error('Expected no error to have been thrown');
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async result (callback: (result: any) => void) {
      try {
        const res = await apiCall();
        callback(res.data);
      } catch (error) {
        const err = error as AxiosError;
        if (err.message === 'Request failed with status code 404')
          throw Error(`${apiName} 404`);

        if (err.response?.status === 500)
          throw Error(`${apiName} 500 - ${err.response?.statusText}`);

        if (err.response?.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((err.response.data as any).error)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            throw Error((err.response.data as any).error as string);
        }

        throw error;
      }
    },

    async toBe200 () {
      this.result(() => {});
    },
  };
}

/**
 * @deprecated
 */
export function expectEqual (
  expected: unknown,
  actual: unknown,
) {
  Object.keys(expected).forEach((key) => {
    if (expected[key] === '_ignore_') {
      expect(actual).toHaveProperty(key);
    }
    else if (expected[key] === '_type_number_') {
      expect(actual).toHaveProperty(key);
      expect(typeof actual[key]).toEqual('number');
    }
    else {
      try {
        expect(actual[key]).toEqual(expected[key]);
      } catch (error) {
        console.log(key);
        throw error;
      }
    }
  });
}

export async function queryDb (
  BACKDOOR_USERNAME: string,
  BACKDOOR_PASSWORD: string,
  sql: string,
) {
  try {
    const bacdoorToken = await TestOwner.sBackdoorLogin(
      DATA_PROVIDER_URL,
      {
        username: BACKDOOR_USERNAME,
        password: BACKDOOR_PASSWORD,
      },
    );
    return TestOwner.query(
      DATA_PROVIDER_URL,
      bacdoorToken,
      sql,
    );
  } catch (error) {
    throw Error('queryDb error - ' + error.message);
  }
}

export const testWrap = (
  dotOnly: string,
  description: string,
  fn: () => Promise<void>,
) => {
  if (dotOnly === '.only') {
    it.only(
      description,
      async () => {
        try {
          await fn();
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const err = error as any;
          if (err.message) {
            throw new Error(err.message);
          } else if (err.code) {
            throw new Error(err.code);
          } else {
            throw error;
          }
        }
      },
    );
  } else {
    it(
      description,
      async () => {
        try {
          await fn();
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const err = error as any;
          if (err.message) {
            throw new Error(err.message);
          } else if (err.code) {
            throw new Error(err.code);
          } else {
            throw error;
          }
        }
      },
    );
  }
};
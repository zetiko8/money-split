import { BACKDOOR_ACTIONS } from '@angular-monorepo/backdoor';
import { AxiosError, AxiosResponse } from 'axios';

export const DATA_PROVIDER_URL = 'http://localhost:3333/data-provider';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async result (callback: (result: any) => void) {
      try {
        const res = await apiCall();
        callback(res.data);
      } catch (error) {
        const err = error as AxiosError;
        if (err.message === 'Request failed with status code 404')
          throw Error(`${apiName} 404`);

        if (err.response?.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((err.response.data as any).error)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            throw Error((err.response.data as any).error as string);
        }

        throw error;
      }
    },
  };
}
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

export async function queryDb (sql: string) {
  try {
    const response = await BACKDOOR_ACTIONS.query(
      DATA_PROVIDER_URL,
      sql,
    );
    return response;
  } catch (error) {
    throw Error('queryDb error - ' + error.message);
  }
}
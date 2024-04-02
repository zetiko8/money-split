import { AxiosError, AxiosResponse } from 'axios';

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
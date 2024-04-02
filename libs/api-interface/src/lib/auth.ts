export interface AjaxI {
  endpoint: string;
  method: 'POST' | 'GET';
}

export interface CallApi<Payload, ResponseType> {
  (
    implementation: (payload: Payload) => Promise<ResponseType>,
    payload: Payload,
  ): Promise<ResponseType>
}

export interface ApiDefinition<Payload, ResponseType> {
  ajax: AjaxI,
  callPromise: CallApi<Payload, ResponseType>
}

export function loginApi(

): ApiDefinition<{
  password: string,
  username: string
}, {
  token: string
}> {

  const ajax: AjaxI = {
    endpoint: '/login',
    method: 'POST',
  };

  return {
    ajax,
    async callPromise (implementation, payload) {
      return await implementation(payload);
    },
  };
}

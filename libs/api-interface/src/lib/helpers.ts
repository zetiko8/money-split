export interface AjaxI {
  endpoint: string;
  method: 'POST' | 'GET';
}

export interface CallApi<Payload, ResponseType> {
  (
    implementation: (
      ajax: AjaxI,
      params: Record<string, string | number>,
      payload: Payload,
    ) => Promise<ResponseType>,
    params: Record<string, string | number>,
    payload: Payload,
  ): Promise<ResponseType>
}

export interface ApiDefinition<
  Payload,
  ResponseType,
> {
  ajax: AjaxI,
  callPromise: CallApi<
    Payload,
    ResponseType
  >
}

export function replaceUrlParams (
  endpoint: string,
  params: Record<string, string | number>,
) {
  let replaced = endpoint;
  Object.values(params as unknown as Record<string, string>)
    .forEach(([ key, value ]) => {
      replaced = replaced.replace(':' + key, String(value));
    });

  return replaced;
}

export function apiDefinition<Payload, ReturnValue>(
  ajax: AjaxI,
): ApiDefinition<Payload, ReturnValue> {
  return {
    ajax,
    async callPromise (implementation, params, payload) {
      return await implementation({
        endpoint: replaceUrlParams(ajax.endpoint, params),
        method: ajax.method,
      }, params, payload);
    },
  };
}

import { Request, Router } from 'express';
import { AppError, TypedRequestBody } from './types';
import { logRequestMiddleware } from './request/service';
import { ERROR_CODE, Owner } from '@angular-monorepo/entities';
import { ApiDefinition } from '@angular-monorepo/api-interface';

export function getControler <B, T>(
  router: Router,
  path: string,
  logic: (
        req: TypedRequestBody<B>,
    ) => Promise<T>,
) {
  router.get(path,
    logRequestMiddleware('GET : ' + path),
    async (
      req: TypedRequestBody<B>,
      res,
      next,
    ) => {
      try {
        const result: T
            = await logic(req);
        res.json(result);
      } catch (error) {
        next(error);
      }
    });
}

export function stringRouteParam (
  request: Request,
  paramName: string,
  options = {
    required: true,
  },
): string {
  const param = request.params[paramName];
  if (options.required && !param) throw Error(
    ERROR_CODE.INVALID_REQUEST);

  return param;
}

export function numberRouteParam (
  request: Request,
  paramName: string,
  options = {
    required: true,
  },
): number {
  const param = request.params[paramName];
  if (options.required && param === undefined) throw Error(
    ERROR_CODE.INVALID_REQUEST);

  const numberParam = Number(param);
  if (Number.isNaN(numberParam)) throw Error(
    ERROR_CODE.INVALID_REQUEST);

  return numberParam;
}

export function parseNumberRouteParam (
  value: string,
  options = {
    required: true,
  },
): number {
  const param = Number(value);
  if (options.required && param === undefined) throw Error(
    ERROR_CODE.INVALID_REQUEST);

  const numberParam = Number(param);
  if (Number.isNaN(numberParam)) throw Error(
    ERROR_CODE.INVALID_REQUEST);

  return numberParam;
}

export function getRandomColor () {
  return '#000000'.replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
}

export function registerRoute <
    Payload,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Params,
    ReturnType,
  >(
  requestDef: ApiDefinition<Payload, Params, ReturnType>,
  router: Router,
  implementation: (
    payload: Payload,
    params: Params,
    context: {
      owner: Owner | null,
    },
  ) => Promise<ReturnType>,
  auth?: ((request: Request) => Promise<Owner>),
) {
  if (requestDef.ajax.method === 'POST') {
    router.post(
      requestDef.ajax.endpoint,
      logRequestMiddleware(`${requestDef.ajax.method} : ${requestDef.ajax.endpoint}`),
      async (
        req: TypedRequestBody<Payload>,
        res,
        next,
      ) => {
        try {
          if (auth) {
            const owner = await auth(req);
            const response = await implementation(
              req.body,
              req.params as Params,
              { owner },
            );
            res.json(response);
          } else {
            const response = await implementation(
              req.body,
              req.params as Params,
              { owner: null },
            );
            res.json(response);
          }
        } catch (error) {
          const err = error as AppError;
          err.context = {
            ajax: requestDef.ajax,
            params: req.params,
            payload: req.body,
          };
          next(error);
        }
      },
    );
  }
  if (requestDef.ajax.method === 'GET') {
    router.get(
      requestDef.ajax.endpoint,
      logRequestMiddleware(`${requestDef.ajax.method} : ${requestDef.ajax.endpoint}`),
      async (
        req: TypedRequestBody<Payload>,
        res,
        next,
      ) => {
        try {
          if (auth) {
            const owner = await auth(req);
            if (
              req.params['ownerKey']
              && req.params['ownerKey'] !== owner.key
            ) throw Error(ERROR_CODE.UNAUTHORIZED);
            const response = await implementation(
              req.body,
              req.params as Params,
              { owner },
            );
            res.json(response);
          } else {
            const response = await implementation(
              req.body,
              req.params as Params,
              { owner: null },
            );
            res.json(response);
          }
        } catch (error) {
          const err = error as AppError;
          err.context = {
            ajax: requestDef.ajax,
            params: req.params,
            payload: req.body,
          };
          next(err);
        }
      },
    );
  }
}

export function errorAppStack (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: Error | any,
  stack: string,
) {
  if (!error.appStack)
    error.appStack = [];
  error.appStack.push(stack);
}

export function appError (
  message: string,
  stack: string,
  originalError: Error,
): AppError {
  return {
    message,
    appStack: [stack],
    originalError,
    context: null,
    isAppError: true,
  };
}

export function isAppError (error: unknown): boolean {
  return !!((error as AppError).isAppError);
}

export async function appErrorWrap <T>(
  logName: string,
  fn: () => Promise<T>,
) {
  try {
    return await fn();
  } catch (error) {
    throw appError (
      error.message,
      logName,
      error,
    );
  }
}

export const VALIDATE = {
  requiredString (value: unknown) {
    if (!value) throw Error(ERROR_CODE.INVALID_REQUEST);
    VALIDATE.string(value);
  },
  requiredPayload (value: unknown) {
    if (!value) throw Error(ERROR_CODE.INVALID_REQUEST);
  },
  string (value: unknown) {
    if (value === null && value == undefined) return;
    if (typeof value !== 'string')
      throw Error(ERROR_CODE.INVALID_REQUEST);
  },
  anyOf (...values) {
    values.forEach((value: unknown) => {
      if (values === null || value === undefined)
        throw Error(ERROR_CODE.INVALID_REQUEST);
    });
  },
};
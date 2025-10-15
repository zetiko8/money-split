import { Request, RequestHandler, Router } from 'express';
import { AppError, TypedRequestBody } from './types';
import { logRequestMiddleware } from './request/service';
import { ERROR_CODE, Owner } from '@angular-monorepo/entities';
import { ApiDefinition } from '@angular-monorepo/api-interface';
import { Logger } from '@angular-monorepo/utils';
import { validationResult } from 'express-validator';

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
  expressValidators?: Array<RequestHandler>,
) {
  if (requestDef.ajax.method === 'POST') {
    router.post(
      requestDef.ajax.endpoint,
      logRequestMiddleware(`${requestDef.ajax.method} : ${requestDef.ajax.endpoint}`),
      ...(expressValidators || [ (req, res, next) => next()]),
      async (
        req: TypedRequestBody<Payload>,
        res,
        next,
      ) => {
        const expressErrors = validationResult(req);

        try {
          if (auth) {
            const owner = await auth(req);
            const response = await implementation(
              req.body,
              req.params as Params,
              { owner },
            );

            if (!expressErrors.isEmpty())
              throw Error(ERROR_CODE.INVALID_REQUEST);

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
            validationErrors: expressErrors.mapped(),
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

export class SimpleLogger implements Logger {
  log(message?: unknown, ...optionalParams: unknown[]) {
    console.log(new Date().toISOString(), message, ...optionalParams);
  }

  error(message?: unknown, ...optionalParams: unknown[]) {
    console.error(new Date().toISOString(), message, ...optionalParams);
  }
}

export const LOGGER = new SimpleLogger();


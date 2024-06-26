import { Request, Router } from 'express';
import { TypedRequestBody } from './types';
import { logRequestMiddleware } from './request/service';
import { ERROR_CODE } from '@angular-monorepo/entities';

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

export async function asyncMap<T, R> (
  array: T[],
  cb: (t: T) => Promise<R>,
) {
  const result: R[] = [];
  for (const item of array) {
    const mapped = await cb(item);
    result.push(mapped);
  }

  return result;
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

export function getRandomColor () {
  return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
}
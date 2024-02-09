import { Router } from 'express';
import { TypedRequestBody } from './types';
import { logRequestMiddleware } from './request/service';

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
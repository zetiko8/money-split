import { Router } from 'express';
import { AVATAR_SERVICE } from './avatar';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { registerRoute } from '../../helpers';
import { getAvatarApi } from '@angular-monorepo/api-interface';
import { logRequestMiddleware } from '../../request/service';
import { TypedRequestBody } from '../../types';
import { asyncMap } from '@angular-monorepo/utils';

export const avatarRouter = Router();

registerRoute(
  getAvatarApi(),
  avatarRouter,
  async (_, params) => {
    return await AVATAR_SERVICE.getById(
      Number(params.avatarId),
    );
  },
  AUTH_SERVICE.auth,
);

avatarRouter.get('/avatar',
  logRequestMiddleware('GET avatar'),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      const queryParams = (req.query['avatarIds'] as string[]);

      const ids = Array.isArray(queryParams)
        ? queryParams.map(id => Number(id))
        : [Number(queryParams)];

      const avatarDatas = await asyncMap(ids, async (id) => {
        return await AVATAR_SERVICE.getById(id);
      });

      res.json(avatarDatas);
    } catch (error) {
      next(error);
    }
  });

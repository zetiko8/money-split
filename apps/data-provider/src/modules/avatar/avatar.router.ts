import { Router } from 'express';
import { AUTH_MIDDLEWARE} from '../../modules/auth/auth-middleware';
import { registerRoute } from '../../helpers';
import { getAvatarApi, getAvatarsApi } from '@angular-monorepo/api-interface';
import { asyncMap } from '@angular-monorepo/utils';
import { AvatarService } from '@angular-monorepo/mysql-adapter';

export const avatarRouter = Router();

registerRoute(
  getAvatarApi(),
  avatarRouter,
  async (_, params, context) => {
    return await new AvatarService(context.logger).getById(
      Number(params.avatarId),
    );
  },
  AUTH_MIDDLEWARE.auth,
);

registerRoute(
  getAvatarsApi(),
  avatarRouter,
  async (_, params, context) => {
    const queryParams = (params.avatarIds);

    const ids = Array.isArray(queryParams)
      ? queryParams.map(id => Number(id))
      : [Number(queryParams)];

    const avatarDatas = await asyncMap(ids, async (id) => {
      return await new AvatarService(context.logger).getById(id);
    });

    return avatarDatas;
  },
  AUTH_MIDDLEWARE.auth,
);

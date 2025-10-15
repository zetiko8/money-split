import { Router } from 'express';
import { AUTH_MIDDLEWARE} from '../../modules/auth/auth-middleware';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { LOGGER, registerRoute } from '../../helpers';
import { getViewUserApi } from '@angular-monorepo/api-interface';
import { UserService } from '@angular-monorepo/mysql-adapter';

export const userRouter = Router();

registerRoute(
  getViewUserApi(),
  userRouter,
  async (payload, params) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!params.namespaceId) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!params.userId) throw Error(ERROR_CODE.INVALID_REQUEST);

    const result = await new UserService(LOGGER).getViewUserViewData(params.userId, params.namespaceId);

    return result;
  },
  AUTH_MIDDLEWARE.auth,
);
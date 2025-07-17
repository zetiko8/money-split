import { Router } from 'express';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { registerRoute } from '../../helpers';
import { getViewUserApi } from '@angular-monorepo/api-interface';
import { USER_SERVICE } from './user';
import { NAMESPACE_SERVICE } from '../namespace/namespace';

export const userRouter = Router();

registerRoute(
  getViewUserApi(),
  userRouter,
  async (payload, params) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!params.namespaceId) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!params.userId) throw Error(ERROR_CODE.INVALID_REQUEST);

    const user = await USER_SERVICE.getUserById(params.userId);
    const namespace = await NAMESPACE_SERVICE.getNamespaceById(params.namespaceId);

    return { user, namespace };
  },
  AUTH_SERVICE.auth,
);
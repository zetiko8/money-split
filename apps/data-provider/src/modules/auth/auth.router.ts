import { Router } from 'express';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { registerRoute } from '../../helpers';
import { loginApi } from '@angular-monorepo/api-interface';

export const authRouter = Router();

registerRoute(
  loginApi(),
  authRouter,
  async (payload) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.username) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.password) throw Error(ERROR_CODE.INVALID_REQUEST);

    const token =
        await AUTH_SERVICE.login(payload.username, payload.password);
    return { token };
  },
);
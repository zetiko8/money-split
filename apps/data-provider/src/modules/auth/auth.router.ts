import { Router } from 'express';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { registerRoute } from '../../helpers';
import { loginApi } from '@angular-monorepo/api-interface';
import { AUTHENTICATION } from '../authentication/authentication';

export const authRouter = Router();

registerRoute(
  loginApi(),
  authRouter,
  async (payload, params, context) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.username) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.password) throw Error(ERROR_CODE.INVALID_REQUEST);

    const token =
        await AUTHENTICATION.login(payload.username, payload.password, context.logger);
    return { token };
  },
);
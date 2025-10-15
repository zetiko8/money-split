import { Router } from 'express';
import { AUTH_MIDDLEWARE} from '../../modules/auth/auth-middleware';
import { LOGGER, registerRoute } from '../../helpers';
import {
  editOwnerProfileApi,
  getOwnerProfileApi,
} from '@angular-monorepo/api-interface';
import { ProfileService } from '@angular-monorepo/mysql-adapter';

export const profileRouter = Router();

registerRoute(
  getOwnerProfileApi(),
  profileRouter,
  async (payload, params, context) => {
    return await new ProfileService(LOGGER).getProfile(
      context.owner.id,
    );
  },
  AUTH_MIDDLEWARE.auth,
);

registerRoute(
  editOwnerProfileApi(),
  profileRouter,
  async (payload, params, context) => {
    return await new ProfileService(LOGGER).editProfile(
      context.owner.id,
      payload,
    );
  },
  AUTH_MIDDLEWARE.auth,
);

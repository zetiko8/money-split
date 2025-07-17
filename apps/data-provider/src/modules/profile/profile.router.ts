import { Router } from 'express';
import { PROFILE_SERVICE } from './profile';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { registerRoute } from '../../helpers';
import {
  editOwnerProfileApi,
  getOwnerProfileApi,
} from '@angular-monorepo/api-interface';

export const profileRouter = Router();

registerRoute(
  getOwnerProfileApi(),
  profileRouter,
  async (payload, params, context) => {
    return await PROFILE_SERVICE.getProfile(
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  editOwnerProfileApi(),
  profileRouter,
  async (payload, params, context) => {
    return await PROFILE_SERVICE.editProfile(
      context.owner.id,
      payload,
    );
  },
  AUTH_SERVICE.auth,
);

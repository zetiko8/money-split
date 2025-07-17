import { Router } from 'express';
import { OWNER_SERVICE } from './owners';
import { VALIDATE, registerRoute } from '../../helpers';
import { registerApi } from '@angular-monorepo/api-interface';

export const ownerRouter = Router();

registerRoute(
  registerApi(),
  ownerRouter,
  async (payload) => {
    VALIDATE.requiredPayload(payload);
    VALIDATE.requiredString(payload.username);
    VALIDATE.requiredString(payload.password);
    VALIDATE.string(payload.avatarColor);
    VALIDATE.string(payload.avatarUrl);
    VALIDATE.anyOf(payload.avatarColor, payload.avatarUrl);

    payload.username = payload.username.trim();
    return await OWNER_SERVICE.createOwner(payload);
  },
);

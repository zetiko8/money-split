import { Router } from 'express';
import { registerRoute } from '../../helpers';
import { registerApi } from '@angular-monorepo/api-interface';
import { VALIDATE } from '@angular-monorepo/entities';
import { OwnerService } from '@angular-monorepo/mysql-adapter';
import { AUTHENTICATION } from '../authentication/authentication';

export const ownerRouter = Router();

registerRoute(
  registerApi(),
  ownerRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    VALIDATE.requiredString(payload.username);
    VALIDATE.requiredString(payload.password);
    VALIDATE.string(payload.avatarColor);
    VALIDATE.string(payload.avatarUrl);
    VALIDATE.anyOf(payload.avatarColor, payload.avatarUrl);

    payload.username = payload.username.trim();
    const hash = AUTHENTICATION.getPasswordHash(payload.password);
    return await new OwnerService(context.logger).createOwner(payload, hash);
  },
);

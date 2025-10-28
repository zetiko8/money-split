import { Router } from 'express';
import { registerRoute, throwValidationError } from '../../helpers';
import { registerApi } from '@angular-monorepo/api-interface';
import { VALIDATE } from '@angular-monorepo/entities';
import { OwnerService } from '@angular-monorepo/mysql-adapter';
import { AUTHENTICATION } from '../authentication/authentication';
import { ESCAPE, TRIM, VALIDATE_DOMAIN_OBJECT } from '@angular-monorepo/data-adapter';

export const ownerRouter = Router();

registerRoute(
  registerApi(),
  ownerRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    payload.username = TRIM(ESCAPE(payload.username)) as string;
    await throwValidationError(async () => {
      return await VALIDATE_DOMAIN_OBJECT.validateRegisterOwner(payload);
    });

    const hash = AUTHENTICATION.getPasswordHash(payload.password);
    return await new OwnerService(context.logger).createOwner(payload, hash);
  },
);

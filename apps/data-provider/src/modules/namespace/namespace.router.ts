import { Router } from 'express';
import { AUTH_MIDDLEWARE} from '../../modules/auth/auth-middleware';
import { registerRoute, throwValidationError } from '../../helpers';
import { VALIDATE } from '@angular-monorepo/entities';
import { ESCAPE, NUMBER, TRIM, VALIDATE_DOMAIN_OBJECT } from '@angular-monorepo/data-adapter';

import {
  createNamespaceApi,
  editNamespaceSettingApi,
  getNamespaceSettingsApi,
  getNamespaceViewApi,
  getOwnerNamespacesApi,
} from '@angular-monorepo/api-interface';
import { NamespaceService } from '@angular-monorepo/mysql-adapter';

export const namespaceRouter = Router();

registerRoute(
  createNamespaceApi(),
  namespaceRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    payload.namespaceName = TRIM(ESCAPE(payload.namespaceName)) as string;
    await throwValidationError(async () => {
      return await VALIDATE_DOMAIN_OBJECT.validateCreateNamespace(
        payload.namespaceName,
        payload.avatarColor,
        payload.avatarUrl,
      );
    });

    return await new NamespaceService(context.logger).createNamespace(
      payload, context.owner);
  },
  AUTH_MIDDLEWARE.auth,
);

registerRoute(
  getNamespaceViewApi(),
  namespaceRouter,
  async (payload, params, context) => {
    return await new NamespaceService(context.logger).getNamespaceViewForOwner(
      NUMBER(params.namespaceId),
      context.owner.id,
    );
  },
  AUTH_MIDDLEWARE.auth,
);

registerRoute(
  getOwnerNamespacesApi(),
  namespaceRouter,
  async (payload, params, context) => {
    return await new NamespaceService(context.logger).getNamespacesForOwner(
      context.owner.id,
    );
  },
  AUTH_MIDDLEWARE.auth,
);

registerRoute(
  getNamespaceSettingsApi(),
  namespaceRouter,
  async (_, params, context) => {
    return await new NamespaceService(context.logger).getNamespaceSettings(
      NUMBER(params.namespaceId),
    );
  },
  AUTH_MIDDLEWARE.auth,
);

registerRoute(
  editNamespaceSettingApi(),
  namespaceRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    payload.namespaceName = TRIM(ESCAPE(payload.namespaceName)) as string;
    await throwValidationError(async () => {
      return await VALIDATE_DOMAIN_OBJECT.validateEditNamespace(
        payload.namespaceName,
        payload.avatarColor,
        payload.avatarUrl,
      );
    });

    return await new NamespaceService(context.logger)
      .editNamespaceSettings(
        context.owner.id,
        NUMBER(params.namespaceId),
        payload,
      );
  },
  AUTH_MIDDLEWARE.auth,
);

import { Router } from 'express';
import { AUTH_MIDDLEWARE} from '../../modules/auth/auth-middleware';
import { registerRoute } from '../../helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';

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
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.namespaceName) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (typeof payload.namespaceName !== 'string') throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.namespaceName.trim()) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (
      !payload.avatarColor && !payload.avatarUrl
    ) throw Error(ERROR_CODE.INVALID_REQUEST);

    payload.namespaceName = payload.namespaceName.trim();
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
      Number(params.namespaceId),
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
      Number(params.namespaceId),
    );
  },
  AUTH_MIDDLEWARE.auth,
);

registerRoute(
  editNamespaceSettingApi(),
  namespaceRouter,
  async (payload, params, context) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.namespaceName) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (typeof payload.namespaceName !== 'string') throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.namespaceName.trim()) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (
      !payload.avatarColor && !payload.avatarUrl
    ) throw Error(ERROR_CODE.INVALID_REQUEST);

    payload.namespaceName = payload.namespaceName.trim();

    return await new NamespaceService(context.logger)
      .editNamespaceSettings(
        context.owner.id,
        Number(params.namespaceId),
        payload,
      );
  },
  AUTH_MIDDLEWARE.auth,
);

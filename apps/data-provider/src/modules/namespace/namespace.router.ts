import { Router } from 'express';
import { NAMESPACE_SERVICE } from './namespace';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { registerRoute } from '../../helpers';
import { ERROR_CODE, MNamespace, RecordView } from '@angular-monorepo/entities';
import { TypedRequestBody } from '../../types';
import { logRequestMiddleware } from '../../request/service';
import { RECORD_SERVICE } from '../record/record';

import {
  createNamespaceApi,
  editNamespaceSettingApi,
  getNamespaceSettingsApi,
  getNamespaceViewApi,
  getOwnerNamespacesApi,
} from '@angular-monorepo/api-interface';

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
    return await NAMESPACE_SERVICE.createNamespace(
      payload, context.owner);
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  getNamespaceViewApi(),
  namespaceRouter,
  async (payload, params, context) => {
    return await NAMESPACE_SERVICE.getNamespaceViewForOwner(
      Number(params.namespaceId),
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

namespaceRouter.get(
  '/:ownerKey/namespace/:namespaceId/edit/record/:recordId',
  logRequestMiddleware('GET edit record'),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      const owner = await AUTH_SERVICE.getOwnerFromRequest(req);

      const recordId = Number(req.params['recordId'] as string);

      const mNamaespace = await NAMESPACE_SERVICE.getNamespaceViewForOwner(
        Number(req.params['namespaceId'] as string),
        owner.id,
      );

      const record = await RECORD_SERVICE
        .getRecordById(recordId);

      const editRecordView: {
        namespace: MNamespace,
        record: RecordView,
      } = {
        namespace: mNamaespace,
        record: (await NAMESPACE_SERVICE.mapToRecordView(
          record,
          mNamaespace,
        )),
      };

      res.json(editRecordView);
    } catch (error) {
      next(error);
    }
  });

registerRoute(
  getOwnerNamespacesApi(),
  namespaceRouter,
  async (payload, params, context) => {
    return await NAMESPACE_SERVICE.getNamespacesForOwner(
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  getNamespaceSettingsApi(),
  namespaceRouter,
  async (_, params) => {
    return await NAMESPACE_SERVICE.getNamespaceSettings(
      Number(params.namespaceId),
    );
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  editNamespaceSettingApi(),
  namespaceRouter,
  async (payload, params) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.namespaceName) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (typeof payload.namespaceName !== 'string') throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.namespaceName.trim()) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (
      !payload.avatarColor && !payload.avatarUrl
    ) throw Error(ERROR_CODE.INVALID_REQUEST);

    payload.namespaceName = payload.namespaceName.trim();

    return await NAMESPACE_SERVICE.editNamespaceSettings(
      Number(params.namespaceId),
      payload,
    );
  },
  AUTH_SERVICE.auth,
);

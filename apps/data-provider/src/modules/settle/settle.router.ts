import { Router } from 'express';
import { SETTLE_SERVICE } from './settle';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { VALIDATE, numberRouteParam, registerRoute } from '../../helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { TypedRequestBody } from '../../types';
import { logRequestMiddleware } from '../../request/service';

import { query } from '../../connection/connection';
import { mysqlDate } from '../../connection/helper';
import {
  settleConfirmApi,
  settleConfirmApiBackdoor,
} from '@angular-monorepo/api-interface';

export const settleRouter = Router();

settleRouter.get('/:ownerKey/namespace/:namespaceId/settle/preview',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      const owner = await AUTH_SERVICE.getOwnerFromRequest(req);

      const settlmentPreview = await SETTLE_SERVICE
        .settleNamespacePreview(
          numberRouteParam(req, 'namespaceId'),
          owner.id,
        );

      res.json(settlmentPreview);
    } catch (error) {
      next(error);
    }
  });

registerRoute(
  settleConfirmApi(),
  settleRouter,
  async (payload, params) => {
    VALIDATE.requiredPayload(payload);
    if (!payload.records.length)
      throw Error(ERROR_CODE.INVALID_REQUEST);

    const result = await SETTLE_SERVICE
      .settle(
        params.byUser,
        params.namespaceId,
        payload.records,
      );

    return result;
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  settleConfirmApiBackdoor(),
  settleRouter,
  async (payload, params) => {
    VALIDATE.requiredPayload(payload);
    if (!payload.records.length)
      throw Error(ERROR_CODE.INVALID_REQUEST);

    const result = await SETTLE_SERVICE
      .settle(
        params.byUser,
        params.namespaceId,
        payload.records,
      );

    const updateSql = `
    UPDATE \`Settlement\`
    SET created = '${mysqlDate(new Date(payload.settledOn))}',
        edited = '${mysqlDate(new Date(payload.settledOn))}'
    WHERE id = ${result.id}
  `;
    await query(updateSql);

    return result;
  },
  AUTH_SERVICE.backdoorAuth,
);

settleRouter.get('/:ownerKey/namespace/:namespaceId/settle/mark-as-settled/:byUser/:settlementDebtId',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      await AUTH_SERVICE.getOwnerFromRequest(req);

      const result = await SETTLE_SERVICE
        .setDebtIsSettled(
          numberRouteParam(req, 'byUser'),
          numberRouteParam(req, 'settlementDebtId'),
          true,
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

settleRouter.get('/:ownerKey/namespace/:namespaceId/settle/mark-as-unsettled/:byUser/:settlementDebtId',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      await AUTH_SERVICE.getOwnerFromRequest(req);

      const result = await SETTLE_SERVICE
        .setDebtIsSettled(
          numberRouteParam(req, 'byUser'),
          numberRouteParam(req, 'settlementDebtId'),
          false,
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

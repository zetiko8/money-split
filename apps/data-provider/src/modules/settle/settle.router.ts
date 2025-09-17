import { Router } from 'express';
import { SETTLE_SERVICE } from './settle';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { VALIDATE, numberRouteParam, registerRoute } from '../../helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { PAYMENT_EVENT_SERVICE } from '../payment-event/payment-event';
import { TypedRequestBody } from '../../types';
import { logRequestMiddleware } from '../../request/service';

import { query } from '../../connection/connection';
import { mysqlDate } from '../../connection/helper';
import {
  settleConfirmApi,
  settleConfirmApiBackdoor,
  settlePreviewApi,
  settleSettingsApi,
} from '@angular-monorepo/api-interface';

export const settleRouter = Router();

registerRoute(
  settleSettingsApi(),
  settleRouter,
  async (payload, params, context) => {
    return await SETTLE_SERVICE
      .getSettleSettings(
        Number(params.namespaceId),
        context.owner.id,
      );
  },
  AUTH_SERVICE.namespaceAuth,
);

registerRoute(
  settlePreviewApi(),
  settleRouter,
  async (payload, params, context) => {
    // Validate required fields
    VALIDATE.requiredPayload(payload);
    VALIDATE.requiredIdArray(payload.paymentEvents);
    VALIDATE.requiredCurrency(payload.mainCurrency);

    // Validate currencies object
    VALIDATE.currencyObject(payload.currencies);

    // Validate payment events
    const namespaceEvents = await PAYMENT_EVENT_SERVICE.getNamespacePaymentEventsView(
      Number(params.namespaceId),
      context.owner.id,
    );
    const paymentEventIds = new Set(namespaceEvents.map(pe => pe.id));
    for (const eventId of payload.paymentEvents) {
      if (!paymentEventIds.has(eventId)) {
        throw Error(ERROR_CODE.INVALID_REQUEST);
      }
    }

    // Validate separatedSettlementPerCurrency
    VALIDATE.requiredBoolean(payload.separatedSettlementPerCurrency);

    const settlmentPreview = await SETTLE_SERVICE
      .settleNamespacePreview(
        Number(params.namespaceId),
        context.owner.id,
      );

    return settlmentPreview;
  },
  AUTH_SERVICE.namespaceAuth,
);

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

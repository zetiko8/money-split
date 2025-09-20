import { Router } from 'express';
import { SETTLE_SERVICE } from './settle';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { numberRouteParam, registerRoute } from '../../helpers';
import { ERROR_CODE, SettlementPayload, VALIDATE } from '@angular-monorepo/entities';
import { PAYMENT_EVENT_SERVICE } from '../payment-event/payment-event';
import { TypedRequestBody } from '../../types';
import { logRequestMiddleware } from '../../request/service';

import {
  settleConfirmApi,
  settlePreviewApi,
  settleSettingsApi,
} from '@angular-monorepo/api-interface';

async function validateSettlementPayload(
  payload: SettlementPayload,
  namespaceId: number,
  ownerId: number,
) {
  // Validate required fields
  VALIDATE.requiredPayload(payload);
  VALIDATE.requiredIdArray(payload.paymentEvents);
  VALIDATE.requiredCurrency(payload.mainCurrency);

  // Validate currencies object
  VALIDATE.currencyObject(payload.currencies);

  // Validate payment events
  const namespaceEvents = await PAYMENT_EVENT_SERVICE.getNamespacePaymentEventsView(
    namespaceId,
    ownerId,
  );
  const paymentEventIds = new Set(namespaceEvents.map(pe => pe.id));
  for (const eventId of payload.paymentEvents) {
    if (!paymentEventIds.has(eventId)) {
      throw Error(ERROR_CODE.INVALID_REQUEST);
    }
  }

  // Validate separatedSettlementPerCurrency
  VALIDATE.requiredBoolean(payload.separatedSettlementPerCurrency);
}

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
    await validateSettlementPayload(
      payload,
      Number(params.namespaceId),
      context.owner.id,
    );

    const settlmentPreview = await SETTLE_SERVICE
      .settleNamespacePreview(
        Number(params.namespaceId),
        payload,
        context.owner.id,
      );

    return settlmentPreview;
  },
  AUTH_SERVICE.namespaceAuth,
);

registerRoute(
  settleConfirmApi(),
  settleRouter,
  async (payload, params, context) => {
    await validateSettlementPayload(
      payload,
      Number(params.namespaceId),
      context.owner.id,
    );

    const result = await SETTLE_SERVICE
      .settle(
        Number(params.byUser),
        Number(params.namespaceId),
        payload,
        context.owner.id,
      );

    return result;
  },
  AUTH_SERVICE.namespaceAuth,
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

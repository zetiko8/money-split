import { Router } from 'express';
import { AUTH_MIDDLEWARE} from '../../modules/auth/auth-middleware';
import { registerRoute } from '../../helpers';
import { ERROR_CODE, SettlementPayload, VALIDATE } from '@angular-monorepo/entities';

import {
  markAsSettledApi,
  markAsUnsettledApi,
  settleConfirmApi,
  settlePreviewApi,
  settleSettingsApi,
} from '@angular-monorepo/api-interface';
import { getTransactionContext, PaymentEventHelpersService, Transaction, SettleService } from '@angular-monorepo/mysql-adapter';

async function validateSettlementPayload(
  transaction: Transaction,
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
  const namespaceEvents = await PaymentEventHelpersService
    .getNamespacePaymentEventsView(transaction, namespaceId, ownerId);;
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
    return await new SettleService(context.logger)
      .getSettleSettings(
        Number(params.namespaceId),
        context.owner.id,
      );
  },
  AUTH_MIDDLEWARE.namespaceAuth,
);

registerRoute(
  settlePreviewApi(),
  settleRouter,
  async (payload, params, context) => {
    await getTransactionContext(
      { logger: context.logger },
      async (transaction) => {
        await validateSettlementPayload(
          transaction,
          payload,
          Number(params.namespaceId),
          context.owner.id,
        );
      },
    );

    const settlmentPreview = await new SettleService(context.logger)
      .settleNamespacePreview(
        Number(params.namespaceId),
        payload,
        context.owner.id,
      );

    return settlmentPreview;
  },
  AUTH_MIDDLEWARE.namespaceAuth,
);

registerRoute(
  settleConfirmApi(),
  settleRouter,
  async (payload, params, context) => {
    await getTransactionContext(
      { logger: context.logger },
      async (transaction) => {
        await validateSettlementPayload(
          transaction,
          payload,
          Number(params.namespaceId),
          context.owner.id,
        );
      },
    );

    const result = await new SettleService(context.logger)
      .settle(
        Number(params.byUser),
        Number(params.namespaceId),
        payload,
        context.owner.id,
      );

    return result;
  },
  AUTH_MIDDLEWARE.namespaceAuth,
);

registerRoute(
  markAsSettledApi(),
  settleRouter,
  async (_, params, context) => {
    await new SettleService(context.logger)
      .setDebtIsSettled(
        Number(params.byUser),
        Number(params.settlementDebtId),
        true,
      );
  },
  AUTH_MIDDLEWARE.namespaceAuth,
);

registerRoute(
  markAsUnsettledApi(),
  settleRouter,
  async (_, params, context) => {
    await new SettleService(context.logger)
      .setDebtIsSettled(
        Number(params.byUser),
        Number(params.settlementDebtId),
        false,
      );
  },
  AUTH_MIDDLEWARE.namespaceAuth,
);

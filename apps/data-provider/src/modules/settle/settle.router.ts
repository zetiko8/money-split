import { Router } from 'express';
import { AUTH_MIDDLEWARE} from '../../modules/auth/auth-middleware';
import { registerRoute, throwValidationError } from '../../helpers';
import { VALIDATE } from '@angular-monorepo/entities';
import { NUMBER, VALIDATE_DOMAIN_OBJECT } from '@angular-monorepo/data-adapter';

import {
  markAsSettledApi,
  markAsUnsettledApi,
  settleConfirmApi,
  settlePreviewApi,
  settleSettingsApi,
} from '@angular-monorepo/api-interface';
import { getTransactionContext, PaymentEventHelpersService, SettleService } from '@angular-monorepo/mysql-adapter';

export const settleRouter = Router();

registerRoute(
  settleSettingsApi(),
  settleRouter,
  async (payload, params, context) => {
    return await new SettleService(context.logger)
      .getSettleSettings(
        NUMBER(params.namespaceId),
        context.owner.id,
      );
  },
  AUTH_MIDDLEWARE.namespaceAuth,
);

registerRoute(
  settlePreviewApi(),
  settleRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    await throwValidationError(async () => {
      return await getTransactionContext(
        { logger: context.logger },
        async (transaction) => {
          return await VALIDATE_DOMAIN_OBJECT.validateSettlement(
            async (paymentEvents: number[]) => {
              const namespaceEvents = await PaymentEventHelpersService
                .getNamespacePaymentEventsView(transaction, NUMBER(params.namespaceId), context.owner.id);
              const paymentEventIds = new Set(namespaceEvents.map(pe => pe.id));
              for (const eventId of paymentEvents) {
                if (!paymentEventIds.has(eventId)) {
                  return {
                    paymentEvents: 'INVALID_PAYMENT_EVENTS',
                  };
                }
              }
              return null;
            },
            payload,
          );
        },
      );
    });

    const settlmentPreview = await new SettleService(context.logger)
      .settleNamespacePreview(
        NUMBER(params.namespaceId),
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
    VALIDATE.requiredPayload(payload);
    await throwValidationError(async () => {
      return await getTransactionContext(
        { logger: context.logger },
        async (transaction) => {
          return await VALIDATE_DOMAIN_OBJECT.validateSettlement(
            async (paymentEvents: number[]) => {
              const namespaceEvents = await PaymentEventHelpersService
                .getNamespacePaymentEventsView(transaction, NUMBER(params.namespaceId), context.owner.id);
              const paymentEventIds = new Set(namespaceEvents.map(pe => pe.id));
              for (const eventId of paymentEvents) {
                if (!paymentEventIds.has(eventId)) {
                  return {
                    paymentEvents: 'INVALID_PAYMENT_EVENTS',
                  };
                }
              }
              return null;
            },
            payload,
          );
        },
      );
    });

    const result = await new SettleService(context.logger)
      .settle(
        NUMBER(params.byUser),
        NUMBER(params.namespaceId),
        payload,
        context.owner.id,
      );

    return result;
  },
  AUTH_MIDDLEWARE.namespaceByUserAuth,
);

registerRoute(
  markAsSettledApi(),
  settleRouter,
  async (_, params, context) => {
    await new SettleService(context.logger)
      .setDebtIsSettled(
        NUMBER(params.byUser),
        NUMBER(params.settlementDebtId),
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
        NUMBER(params.byUser),
        NUMBER(params.settlementDebtId),
        false,
      );
  },
  AUTH_MIDDLEWARE.namespaceAuth,
);

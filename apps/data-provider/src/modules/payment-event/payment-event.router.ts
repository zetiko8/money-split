import { Router } from 'express';
import { AUTH_MIDDLEWARE} from '../../modules/auth/auth-middleware';
import { registerRoute } from '../../helpers';
import {
  addPaymentEventApi,
  editPaymentEventApi,
  getPaymentEventApi,
  getEditPaymentEventViewApi,
  addPaymentEventApiBackdoor,
} from '@angular-monorepo/api-interface';
import {
  CreatePaymentEventData,
  ERROR_CODE,
  PaymentEvent,
  VALIDATE,
  validatePaymentEvent,
} from '@angular-monorepo/entities';
import { AppError } from '../../types';
import { PaymentEventService } from '@angular-monorepo/mysql-adapter';

export const paymentEventRouter = Router();

registerRoute(
  getEditPaymentEventViewApi(),
  paymentEventRouter,
  async (payload, params, context) => {
    return new PaymentEventService(context.logger).getEditPaymentEventView(
      Number(params.namespaceId),
      Number(params.paymentEventId),
      context.owner.id,
    );
  },
  AUTH_MIDDLEWARE.auth,
);

registerRoute(
  getPaymentEventApi(),
  paymentEventRouter,
  async (payload, params, context) => {
    return await new PaymentEventService(context.logger).getPaymentEvent(
      Number(params.namespaceId),
      Number(params.paymentEventId),
      context.owner.id,
    );
  },
  AUTH_MIDDLEWARE.auth,
);

registerRoute(
  editPaymentEventApi(),
  paymentEventRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);

    validatePaymentEventApi(payload);

    return await new PaymentEventService(context.logger).editPaymentEvent(
      Number(params.namespaceId),
      Number(params.userId),
      Number(params.paymentEventId),
      payload,
      context.owner.id,
    );
  },
  AUTH_MIDDLEWARE.auth,
);

registerRoute(
  addPaymentEventApi(),
  paymentEventRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    validatePaymentEventApi(payload);

    context.logger.log('VALIDATION PASSED');
    return await new PaymentEventService(context.logger).addPaymentEvent(
      Number(params.namespaceId),
      Number(params.userId),
      payload,
      context.owner.id,
    );
  },
  AUTH_MIDDLEWARE.auth,
);

// TODO - move to cybackdoor router
registerRoute(
  addPaymentEventApiBackdoor(),
  paymentEventRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    validatePaymentEventApi(payload);

    return await new PaymentEventService(context.logger).addPaymentEventBackdoor(
      payload,
    );
  },
  AUTH_MIDDLEWARE.backdoorAuth,
);

function validatePaymentEventApi (
  payload: CreatePaymentEventData | PaymentEvent,
) {
  try {
    validatePaymentEvent(payload);
  } catch (error) {
    if (error.message === ERROR_CODE.INVALID_PAYMENT_EVENT_AMOUNTS) {
      const err = new Error(ERROR_CODE.INVALID_REQUEST) as unknown as AppError;
      err.context = error.message;
      throw err;
    }
    throw error;
  }
}
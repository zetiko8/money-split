import { Router } from 'express';
import { PAYMENT_EVENT_SERVICE } from './payment-event';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { registerRoute } from '../../helpers';
import {
  addPaymentEventApi,
  editPaymentEventApi,
  getPaymentEventApi,
  getEditPaymentEventViewApi,
  addPaymentEventApiBackdoor,
} from '@angular-monorepo/api-interface';
import { NAMESPACE_SERVICE } from '../namespace/namespace';
import {
  CreatePaymentEventData,
  ERROR_CODE,
  PaymentEvent,
  VALIDATE,
  validatePaymentEvent,
} from '@angular-monorepo/entities';
import { AppError } from '../../types';

export const paymentEventRouter = Router();

registerRoute(
  getEditPaymentEventViewApi(),
  paymentEventRouter,
  async (payload, params, context) => {
    const [namespace, paymentEvent] = await Promise.all([
      NAMESPACE_SERVICE.getNamespaceViewForOwner(
        Number(params.namespaceId),
        context.owner.id,
      ),
      PAYMENT_EVENT_SERVICE.getPaymentEvent(
        Number(params.namespaceId),
        Number(params.paymentEventId),
        context.owner.id,
      ),
    ]);

    return { namespace, paymentEvent };
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  getPaymentEventApi(),
  paymentEventRouter,
  async (payload, params, context) => {
    return await PAYMENT_EVENT_SERVICE.getPaymentEvent(
      Number(params.namespaceId),
      Number(params.paymentEventId),
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  editPaymentEventApi(),
  paymentEventRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);

    validatePaymentEventApi(payload);

    return await PAYMENT_EVENT_SERVICE.editPaymentEvent(
      Number(params.namespaceId),
      Number(params.userId),
      Number(params.paymentEventId),
      payload,
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  addPaymentEventApi(),
  paymentEventRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    validatePaymentEventApi(payload);

    return await PAYMENT_EVENT_SERVICE.addPaymentEvent(
      Number(params.namespaceId),
      Number(params.userId),
      payload,
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  addPaymentEventApiBackdoor(),
  paymentEventRouter,
  async (payload) => {
    VALIDATE.requiredPayload(payload);
    validatePaymentEventApi(payload);

    return await PAYMENT_EVENT_SERVICE.addPaymentEventBackdoor(
      payload,
    );
  },
  AUTH_SERVICE.backdoorAuth,
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
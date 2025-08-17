import { Router } from 'express';
import { PAYMENT_EVENT_SERVICE } from './payment-event';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { VALIDATE, registerRoute } from '../../helpers';
import {
  addPaymentEventApi,
  editPaymentEventApi,
  getPaymentEventApi,
  getEditPaymentEventViewApi,
  addPaymentEventApiBackdoor,
} from '@angular-monorepo/api-interface';
import { NAMESPACE_SERVICE } from '../namespace/namespace';
import { CreatePaymentEventData, ERROR_CODE, validatePaymentAmounts } from '@angular-monorepo/entities';
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
    validatePaymentEvent(payload);

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
    validatePaymentEvent(payload);

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
    validatePaymentEvent(payload);

    return await PAYMENT_EVENT_SERVICE.addPaymentEventBackdoor(
      payload,
    );
  },
  AUTH_SERVICE.backdoorAuth,
);

function validatePaymentEvent (payload: CreatePaymentEventData) {
  VALIDATE.requiredArray(payload.paidBy);
  VALIDATE.requiredArray(payload.benefitors);

  // Validate each paidBy node
  payload.paidBy.forEach(node => {
    VALIDATE.requiredBigint(node.userId);
    VALIDATE.requiredNumber(node.amount);
    VALIDATE.requiredCurrency(node.currency);
  });

  // Validate each benefitor node
  payload.benefitors.forEach(node => {
    VALIDATE.requiredBigint(node.userId);
    VALIDATE.requiredNumber(node.amount);
    VALIDATE.requiredCurrency(node.currency);
  });

  // Optional fields
  if (payload.description !== undefined) VALIDATE.string(payload.description);
  if (payload.notes !== undefined) VALIDATE.string(payload.notes);

  // Validate payment amounts match per currency
  try {
    validatePaymentAmounts(payload.paidBy, payload.benefitors);
  } catch (error) {
    const err = new Error(ERROR_CODE.INVALID_REQUEST) as unknown as AppError;
    err.context = error.message;
    throw err;
  }
}
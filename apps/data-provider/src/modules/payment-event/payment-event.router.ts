import { Router } from 'express';
import { PAYMENT_EVENT_SERVICE } from './payment-event';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { VALIDATE, registerRoute } from '../../helpers';
import {
  addPaymentEventApi,
  editPaymentEventApi,
  getPaymentEventApi,
} from '@angular-monorepo/api-interface';

export const paymentEventRouter = Router();

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

    // Validate each paidBy and benefitor node has the required fields
    payload.paidBy.forEach(node => {
      VALIDATE.requiredBigint(node.userId);
      VALIDATE.requiredNumber(node.amount);
    });

    payload.benefitors.forEach(node => {
      VALIDATE.requiredBigint(node.userId);
      VALIDATE.requiredNumber(node.amount);
    });

    // Optional fields
    if (payload.description !== undefined) VALIDATE.string(payload.description);
    if (payload.notes !== undefined) VALIDATE.string(payload.notes);

    return await PAYMENT_EVENT_SERVICE.addPaymentEvent(
      params.namespaceId,
      params.userId,
      payload,
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

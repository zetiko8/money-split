import { Router } from 'express';
import { AUTH_MIDDLEWARE} from '../../modules/auth/auth-middleware';
import { registerRoute, throwValidationError } from '../../helpers';
import {
  addPaymentEventApi,
  editPaymentEventApi,
  getPaymentEventApi,
  getEditPaymentEventViewApi,
  addPaymentEventApiBackdoor,
} from '@angular-monorepo/api-interface';
import { VALIDATE } from '@angular-monorepo/entities';
import { PaymentEventService } from '@angular-monorepo/mysql-adapter';
import { NUMBER, VALIDATE_DOMAIN_OBJECT } from '@angular-monorepo/data-adapter';

export const paymentEventRouter = Router();

registerRoute(
  getEditPaymentEventViewApi(),
  paymentEventRouter,
  async (payload, params, context) => {
    return new PaymentEventService(context.logger).getEditPaymentEventView(
      NUMBER(params.namespaceId),
      NUMBER(params.paymentEventId),
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
      NUMBER(params.namespaceId),
      NUMBER(params.paymentEventId),
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
    await throwValidationError(async () => {
      return await VALIDATE_DOMAIN_OBJECT.validatePaymentEvent(payload);
    });

    return await new PaymentEventService(context.logger).editPaymentEvent(
      NUMBER(params.namespaceId),
      NUMBER(params.userId),
      NUMBER(params.paymentEventId),
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
    await throwValidationError(async () => {
      return await VALIDATE_DOMAIN_OBJECT.validatePaymentEvent(payload);
    });

    context.logger.log('VALIDATION PASSED');
    return await new PaymentEventService(context.logger).addPaymentEvent(
      NUMBER(params.namespaceId),
      NUMBER(params.userId),
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
    await throwValidationError(async () => {
      return await VALIDATE_DOMAIN_OBJECT.validatePaymentEvent(payload);
    });

    return await new PaymentEventService(context.logger).addPaymentEventBackdoor(
      payload,
    );
  },
  AUTH_MIDDLEWARE.backdoorAuth,
);
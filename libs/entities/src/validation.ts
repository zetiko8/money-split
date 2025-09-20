import { CreatePaymentEventData, PaymentEvent, PaymentEventData, validatePaymentAmounts } from '.';
import { ERROR_CODE } from './error';

export const VALIDATE = {
  requiredString (value: unknown) {
    if (!value) throw Error(ERROR_CODE.INVALID_REQUEST);
    VALIDATE.string(value);
    if (!(value as string).trim()) throw Error(ERROR_CODE.INVALID_REQUEST);
  },
  requiredPayload (value: unknown) {
    if (!value) throw Error(ERROR_CODE.INVALID_REQUEST);
  },
  string (value: unknown) {
    if (value === null && value == undefined) return;
    if (typeof value !== 'string')
      throw Error(ERROR_CODE.INVALID_REQUEST);
  },
  number (value: unknown) {
    if (value === null || value === undefined) return;
    if (typeof value !== 'number' || isNaN(value))
      throw Error(ERROR_CODE.INVALID_REQUEST);
  },
  requiredNumber (value: unknown) {
    if (value === undefined || value === null) throw Error(ERROR_CODE.INVALID_REQUEST);
    VALIDATE.number(value);
  },
  array (value: unknown) {
    if (value === null || value === undefined) return;
    if (!Array.isArray(value))
      throw Error(ERROR_CODE.INVALID_REQUEST);
  },
  requiredArray (value: unknown) {
    if (!value) throw Error(ERROR_CODE.INVALID_REQUEST);
    VALIDATE.array(value);
    if ((value as unknown[]).length === 0) throw Error(ERROR_CODE.INVALID_REQUEST);
  },
  currency (value: unknown) {
    if (value === null || value === undefined) return;
    VALIDATE.string(value);
    if (!(value as string).match(/^[A-Z]{3}$/))
      throw Error(ERROR_CODE.INVALID_REQUEST);
  },
  requiredCurrency (value: unknown) {
    if (!value) throw Error(ERROR_CODE.INVALID_REQUEST);
    VALIDATE.currency(value);
  },
  anyOf (...values: unknown[]) {
    values.forEach((value: unknown) => {
      if (values === null || value === undefined)
        throw Error(ERROR_CODE.INVALID_REQUEST);
    });
  },
  bigint (value: unknown) {
    if (value === null || value === undefined) return;
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0)
      throw Error(ERROR_CODE.INVALID_REQUEST);
  },
  requiredBigint (value: unknown) {
    if (!value) throw Error(ERROR_CODE.INVALID_REQUEST);
    VALIDATE.bigint(value);
  },

  boolean (value: unknown) {
    if (value === null || value === undefined) return;
    if (typeof value !== 'boolean') {
      throw Error(ERROR_CODE.INVALID_REQUEST);
    }
  },

  requiredBoolean (value: unknown) {
    if (value === undefined || value === null) throw Error(ERROR_CODE.INVALID_REQUEST);
    VALIDATE.boolean(value);
  },

  object (value: unknown) {
    if (value === null || value === undefined) return;
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw Error(ERROR_CODE.INVALID_REQUEST);
    }
  },

  requiredObject (value: unknown) {
    if (!value) throw Error(ERROR_CODE.INVALID_REQUEST);
    VALIDATE.object(value);
  },

  nonNegativeNumber (value: unknown) {
    VALIDATE.number(value);
    if ((value as number) < 0) {
      throw Error(ERROR_CODE.INVALID_REQUEST);
    }
  },

  requiredNonNegativeNumber (value: unknown) {
    VALIDATE.requiredNumber(value);
    VALIDATE.nonNegativeNumber(value);
  },

  currencyObject (value: Record<string, unknown>) {
    VALIDATE.requiredObject(value);
    for (const [code, amount] of Object.entries(value)) {
      VALIDATE.currency(code);
      VALIDATE.nonNegativeNumber(amount);
    }
  },

  idArray (value: unknown) {
    if (value === null || value === undefined) return;
    VALIDATE.array(value);
    for (const item of value as unknown[]) {
      VALIDATE.bigint(item);
    }
  },

  requiredIdArray (value: unknown) {
    VALIDATE.requiredArray(value);
    VALIDATE.idArray(value);
  },
};

export function validatePaymentEvent (
  payload: CreatePaymentEventData | PaymentEvent,
) {
  // Optional fields
  if (payload.description !== undefined) VALIDATE.string(payload.description);
  if (payload.notes !== undefined) VALIDATE.string(payload.notes);

  validatePaymentEventData(payload);
}

export function validatePaymentEventData (payload: PaymentEventData) {
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

  // Validate payment amounts match per currency
  try {
    validatePaymentAmounts(payload.paidBy, payload.benefitors);
  } catch (error) {
    const err = new Error(ERROR_CODE.INVALID_PAYMENT_EVENT_AMOUNTS);
    throw err;
  }
}
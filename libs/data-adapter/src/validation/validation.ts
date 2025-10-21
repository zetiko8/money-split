import { VALIDATE } from '@angular-monorepo/entities';
import { AcceptInvitationDataValidationFn, ValidationErrors } from './validation.service.interface';
import { escape } from 'validator';

const catchToValidationError = (
  validationFn: () => void,
  propertyName: string,
  errorName: string,
): ValidationErrors | null => {
  try {
    validationFn();
    return null;
  } catch (error) {
    return {
      [propertyName]: errorName,
    };
  }
};

const validationChain = (
  validationFns: {
    fn: (() => void),
    propertyName: string,
    errorName: string }[],
): ValidationErrors | null => {
  for (const fn of validationFns) {
    const res = catchToValidationError(() => fn.fn(), fn.propertyName, fn.errorName);
    if (res) return res;
  }
  return null;
};

export const TRIM = (str: unknown) => {
  if (str === undefined || str === null) return str;
  if (typeof str !== 'string') return str;
  return str.trim();
};

export const ESCAPE = (str: unknown) => {
  if (str === undefined || str === null) return str;
  if (typeof str !== 'string') return str;
  return escape(str);
};

export const NUMBER = (input: unknown) => {
  return Number(input);
};

export const VALIDATE_DOMAIN_OBJECT_STATELESS = {
  validateInvitationName (name: string) {
    return validationChain([
      {
        fn: () => VALIDATE.requiredString(name),
        propertyName: 'name',
        errorName: 'NAME_REQUIRED',
      },
      {
        fn: () => VALIDATE.stringMaxLength(name, 20),
        propertyName: 'name',
        errorName: 'NAME_MAX_LENGTH',
      },
      {
        fn: () => VALIDATE.stringNoSpecialCharacters(name),
        propertyName: 'name',
        errorName: 'NAME_NO_SPECIAL_CHARACTERS',
      },
    ]);
  },
};

export const VALIDATE_DOMAIN_OBJECT = {
  async validateAcceptInvitation (
    acceptInvitationDataValidationFn: AcceptInvitationDataValidationFn,
    key: string,
    ownerId: number,
    name: string,
  ) {
    const statelessValidationErrors
      = VALIDATE_DOMAIN_OBJECT_STATELESS
        .validateInvitationName(name);
    if (statelessValidationErrors)
      return statelessValidationErrors;
    const databaseValidationErrors
      = await acceptInvitationDataValidationFn(key, ownerId, name);
    if (databaseValidationErrors)
      return databaseValidationErrors;
    return null;
  },
  async validateCreateInvitation (
    email: string,
  ) {
    return validationChain([
      {
        fn: () => VALIDATE.requiredString(email),
        propertyName: 'email',
        errorName: 'EMAIL',
      },
      {
        fn: () => VALIDATE.stringMaxLength(email, 64 + 9),
        propertyName: 'email',
        errorName: 'EMAIL_MAX_LENGTH',
      },
      {
        fn: () => VALIDATE.isEmail(email),
        propertyName: 'email',
        errorName: 'EMAIL',
      },
    ]);
  },
};

import { ValidationErrors } from '@angular/forms';

export enum AppErrorCode {
    ServerError = 'ServerError',
    AbiGetPonudboException = 'AbiGetPonudboException',
    Unknown = 'Unknown',
    FormValidation = 'FormValidation',
    MissingRequiredParam = 'MissingRequiredParam',
    AuthenticationProviderFail = 'AuthenticationProviderFail',
  }

export class AppError extends Error {
  public code: AppErrorCode;
  public appMessage: string | undefined;
  
  constructor(
    code: AppErrorCode = AppErrorCode.Unknown,
    appMessage?: string,
  ) {
    super(code);
  
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AppError.prototype);
    this.code = code;
    this.appMessage = appMessage;
  }
}

export class FormValidationError extends AppError {

  public formErrors: ValidationErrors = {};
  
  constructor(
    formErrors: ValidationErrors,
  ) {
    super(AppErrorCode.FormValidation);
  
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, FormValidationError.prototype);
  
    this.formErrors = formErrors;
  }
}
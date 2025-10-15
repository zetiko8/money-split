import { AjaxI } from '@angular-monorepo/api-interface';
import { Request } from 'express';
import { ValidationError } from 'express-validator';

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export enum EntityPropertyType {
  STRING = 'STRING',
  NON_EMPTY_STRING = 'NON_EMPTY_STRING',
  AUTO_ID = 'AUTO_ID',
  ID = 'ID',
  NULLABLE_ID = 'NULLABLE_ID',
  NOT_NULL_INT = 'NOT_NULL_INT',
  STRING1000 = 'STRING1000',
  TEXT = 'TEXT',
  NON_ZERO_NON_NULL_NUMBER = 'NON_ZERO_NON_NULL_NUMBER',
  BOOL = 'BOOL',
  JSON = 'JSON',
  DOUBLE = 'DOUBLE',
  DATETIME = 'DATETIME',
  NULLABLE_DATETIME = 'NULLABLE_DATETIME',
  BLOB = 'BLOB',
}

export type Entity = Record<string, EntityPropertyType>;

export const SettlementDebtEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  created: EntityPropertyType.DATETIME,
  edited: EntityPropertyType.DATETIME,
  createdBy: EntityPropertyType.ID,
  editedBy: EntityPropertyType.ID,
  data: EntityPropertyType.JSON,
  namespaceId: EntityPropertyType.ID,
  settlementId: EntityPropertyType.NULLABLE_ID,
  settled: EntityPropertyType.BOOL,
  settledOn: EntityPropertyType.NULLABLE_DATETIME,
  settledBy: EntityPropertyType.NULLABLE_ID,
};

export const SettlementEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  created: EntityPropertyType.DATETIME,
  edited: EntityPropertyType.DATETIME,
  createdBy: EntityPropertyType.ID,
  editedBy: EntityPropertyType.ID,
  namespaceId: EntityPropertyType.ID,
};

export interface AppError {
  message: string,
  appStack: string[],
  originalError: Error,
  context: {
    ajax: AjaxI,
    payload: unknown,
    params: unknown,
    validationErrors?: Record<string, ValidationError>,
  } | null,
  isAppError: true,
};

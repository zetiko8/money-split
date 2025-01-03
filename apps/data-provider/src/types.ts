import { AjaxI } from '@angular-monorepo/api-interface';
import { Request } from 'express';

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

export const OwnerEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  key: EntityPropertyType.NON_EMPTY_STRING,
  username: EntityPropertyType.NON_EMPTY_STRING,
  hash: EntityPropertyType.NON_EMPTY_STRING,
  avatarId: EntityPropertyType.ID,
};

export const NamespaceOwnerEntity: Entity = {
  ownerId: EntityPropertyType.ID,
  namespaceId: EntityPropertyType.ID,
};

export const MNamespaceEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  name: EntityPropertyType.NON_EMPTY_STRING,
  avatarId: EntityPropertyType.ID,
};

export const UserEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  namespaceId: EntityPropertyType.ID,
  name: EntityPropertyType.NON_EMPTY_STRING,
  ownerId: EntityPropertyType.ID,
  avatarId: EntityPropertyType.ID,
};

export const RecordEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  created: EntityPropertyType.DATETIME,
  edited: EntityPropertyType.DATETIME,
  createdBy: EntityPropertyType.ID,
  editedBy: EntityPropertyType.ID,
  data: EntityPropertyType.JSON,
  namespaceId: EntityPropertyType.ID,
  settlementId: EntityPropertyType.NULLABLE_ID,
};

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

export const InvitationEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  email: EntityPropertyType.NON_EMPTY_STRING,
  created: EntityPropertyType.DATETIME,
  edited: EntityPropertyType.DATETIME,
  namespaceId: EntityPropertyType.ID,
  createdBy: EntityPropertyType.ID,
  editedBy: EntityPropertyType.ID,
  accepted: EntityPropertyType.BOOL,
  rejected: EntityPropertyType.BOOL,
  invitationKey: EntityPropertyType.NON_EMPTY_STRING,
};

export const AvatarEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  color: EntityPropertyType.STRING,
  url: EntityPropertyType.STRING,
};

export interface AppError {
  message: string,
  appStack: string[],
  originalError: Error,
  context: {
    ajax: AjaxI,
    payload: unknown,
    params: unknown,
  } | null,
  isAppError: true,
};

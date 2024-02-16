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
}

export type Entity = Record<string, EntityPropertyType>;

export const OwnerEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  key: EntityPropertyType.NON_EMPTY_STRING,
  username: EntityPropertyType.NON_EMPTY_STRING,
  hash: EntityPropertyType.NON_EMPTY_STRING,
};

export const NamespaceOwnerEntity: Entity = {
  ownerId: EntityPropertyType.ID,
  namespaceId: EntityPropertyType.ID,
};

export const MNamespaceEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  name: EntityPropertyType.NON_EMPTY_STRING,
};

export const UserEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  namespaceId: EntityPropertyType.ID,
  name: EntityPropertyType.NON_EMPTY_STRING,
  ownerId: EntityPropertyType.ID,
};

export const RecordEntity: Entity = {
  id: EntityPropertyType.AUTO_ID,
  created: EntityPropertyType.DATETIME,
  edited: EntityPropertyType.DATETIME,
  createdBy: EntityPropertyType.ID,
  editedBy: EntityPropertyType.ID,
  data: EntityPropertyType.JSON,
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

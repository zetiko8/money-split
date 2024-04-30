import {
  CreateNamespacePayload,
  Invitation,
  InvitationViewData,
  MNamespace,
  NamespaceView,
  Owner,
  OwnerProfileView,
  RegisterOwnerPayload,
} from '@angular-monorepo/entities';
import { apiDefinition } from './helpers';

export function createNamespaceApi() {
  return apiDefinition<
  CreateNamespacePayload,
  {
    ownerKey: string,
  },
  MNamespace>({
    endpoint: '/:ownerKey/namespace',
    method: 'POST',
  });
}

export function getNamespaceViewApi() {
  return apiDefinition<
  null,
  {
    ownerKey: string,
    namespaceId: string,
  },
  NamespaceView>({
    endpoint: '/:ownerKey/namespace/:namespaceId',
    method: 'GET',
  });
}

export function getOwnerProfileApi() {
  return apiDefinition<
  null,
  {
    ownerKey: string,
  },
  OwnerProfileView
  >({
    endpoint: '/:ownerKey/profile',
    method: 'GET',
  });
}

export function createInvitationApi() {
  return apiDefinition<
  { email: string },
  {
    ownerKey: string,
    namespaceId: number,
  },
  Invitation>({
    endpoint: '/:ownerKey/namespace/:namespaceId/invite',
    method: 'POST',
  });
}

export function registerApi() {
  return apiDefinition<
  RegisterOwnerPayload,
  null,
  Owner>({
    endpoint: '/register',
    method: 'POST',
  });
}

export function acceptInvitationApi() {
  return apiDefinition<
  { name: string },
  {
    invitationKey: string,
  },
  Invitation>({
    endpoint: '/invitation/:invitationKey/accept',
    method: 'POST',
  });
}

export function getInvitationViewApi() {
  return apiDefinition<
  null,
  {
    invitationKey: string,
  },
  InvitationViewData>({
    endpoint: '/invitation/:invitationKey',
    method: 'GET',
  });
}

export function getOwnerNamespacesApi() {
  return apiDefinition<
  null,
  {
    ownerKey: string,
  },
  MNamespace[]>({
    endpoint: '/:ownerKey/namespace',
    method: 'GET',
  });
}
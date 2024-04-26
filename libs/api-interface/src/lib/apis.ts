import { CreateNamespacePayload, Invitation, MNamespace, NamespaceView, OwnerProfileView } from '@angular-monorepo/entities';
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

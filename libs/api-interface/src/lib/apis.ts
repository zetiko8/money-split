import { CreateNamespacePayload, MNamespace, NamespaceView } from '@angular-monorepo/entities';
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


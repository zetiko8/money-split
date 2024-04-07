import { CreateNamespacePayload, MNamespace } from '@angular-monorepo/entities';
import { apiDefinition } from './helpers';

export function createNamespaceApi() {
  return apiDefinition<CreateNamespacePayload,
  MNamespace>({
    endpoint: '/:ownerKey/namespace',
    method: 'POST',
  });
}


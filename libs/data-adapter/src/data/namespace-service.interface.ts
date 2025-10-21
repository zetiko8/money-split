import {
  CreateNamespacePayload,
  MNamespace,
  MNamespaceSettings,
  NamespaceView,
  Owner,
} from '@angular-monorepo/entities';

export interface INamespaceService {
  getNamespacesForOwner(
    ownerId: number,
  ): Promise<MNamespace[]>;

  createNamespace(
    payload: CreateNamespacePayload,
    owner: Owner,
  ): Promise<MNamespace>;

  getNamespaceViewForOwner(
    namespaceId: number,
    ownerId: number,
  ): Promise<NamespaceView>;

  getNamespaceSettings(
    namespaceId: number,
  ): Promise<MNamespaceSettings>;

  editNamespaceSettings(
    ownerId: number,
    namespaceId: number,
    payload: CreateNamespacePayload,
  ): Promise<MNamespaceSettings>;
}

import {
  CreateNamespacePayload,
  MNamespace,
  MNamespaceSettings,
  NamespaceView,
  Owner,
} from '@angular-monorepo/entities';
import { Logger } from '@angular-monorepo/utils';
import { getTransactionContext } from '../mysql-adapter';
import { NamespaceHelpersService } from './namespace.helpers.service';
import { INamespaceService } from '@angular-monorepo/data-adapter';

export class NamespaceService implements INamespaceService {

  constructor(
    private readonly logger: Logger,
  ) {}

  async getNamespacesForOwner(
    ownerId: number,
  ): Promise<MNamespace[]> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        return NamespaceHelpersService
          .getNamespacesForOwner(transaction, ownerId);
      });
  }

  async getNamespaceViewForOwner(
    namespaceId: number,
    ownerId: number,
  ): Promise<NamespaceView> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        return NamespaceHelpersService
          .getNamespaceViewForOwner(
            transaction,
            namespaceId,
            ownerId,
          );
      });
  }

  async createNamespace(
    payload: CreateNamespacePayload,
    owner: Owner,
  ): Promise<MNamespace> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const result = await transaction.jsonProcedure<MNamespace>(
          'call createNamespace(?, ?, ?, ?, ?, ?);',
          [payload.namespaceName,
            owner.id,
            payload.avatarColor,
            payload.avatarUrl,
            owner.username,
            owner.avatarId,
          ],
        );
        return result;
      });
  }

  async getNamespaceSettings(
    namespaceId: number,
  ): Promise<MNamespaceSettings> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const result = await transaction.jsonProcedure<MNamespaceSettings>(
          'call getNamespaceSettings(?);',
          [namespaceId],
        );
        return result;
      });
  }

  async editNamespaceSettings(
    ownerId: number,
    namespaceId: number,
    payload: CreateNamespacePayload,
  ): Promise<MNamespaceSettings> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const result = await transaction.jsonProcedure<MNamespaceSettings>(
          'call editNamespaceSettings(?, ?, ?, ?, ?);',
          [
            ownerId,
            namespaceId,
            payload.namespaceName,
            payload.avatarColor,
            payload.avatarUrl,
          ],
        );
        return result;
      });
  }
}

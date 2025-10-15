import { IUserService } from '@angular-monorepo/data-adapter';
import { getTransactionContext } from '../mysql-adapter';
import { User, ViewUserViewData } from '@angular-monorepo/entities';
import { Logger } from '@angular-monorepo/utils';
import { UserHelpersService } from './user.helpers.service';
import { NamespaceHelpersService } from './namespace.helpers.service';

export class UserService implements IUserService {

  constructor(
    private readonly logger: Logger,
  ) {}

  async getNamespaceOwnerUsers(
    ownerId: number,
    namespaceId: number,
  ): Promise<User[]> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const ownerUsers = await UserHelpersService.getNamespaceOwnerUsers(
          transaction,
          ownerId,
          namespaceId,
        );
        return ownerUsers;
      });
  }

  async getOwnerUsers(
    ownerId: number,
  ): Promise<User[]> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const ownerUsers = await transaction.query<User[]>(
          'SELECT * FROM `User` WHERE ownerId = ?',
          [ownerId],
        );
        return ownerUsers;
      });
  }

  async getUserById(
    id: number,
  ): Promise<User> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const user = await UserHelpersService.getUserById(transaction, id);
        return user;
      });
  }

  async updateUserAvatar(
    userId: number,
    avatarId: number,
  ): Promise<void> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        await transaction.query(
          'UPDATE `User` SET avatarId = ? WHERE id = ?',
          [avatarId, userId],
        );
      });
  }

  async getViewUserViewData(
    userId: number,
    namespaceId: number,
  ): Promise<ViewUserViewData> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const user = await UserHelpersService
          .getUserById(transaction, userId);
        const namespace = await NamespaceHelpersService
          .getNamespaceById(transaction, namespaceId);

        return { user, namespace };
      });
  }

}

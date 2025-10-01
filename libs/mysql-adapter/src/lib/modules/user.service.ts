import { IUserService } from '@angular-monorepo/data-adapter';
import { getTransaction } from '../mysql-adapter';
import { User } from '@angular-monorepo/entities';
import { Logger } from '@angular-monorepo/utils';
import { UserHelpersService } from './user.helpers.service';

export class UserService implements IUserService {

  constructor(
    private readonly logger: Logger,
  ) {}

  async getNamespaceOwnerUsers(
    ownerId: number,
    namespaceId: number,
  ): Promise<User[]> {
    const transaction = await getTransaction(this.logger);
    const ownerUsers = await UserHelpersService.getNamespaceOwnerUsers(
      transaction,
      ownerId,
      namespaceId,
    );
    await transaction.commit();
    return ownerUsers;
  }

  async getOwnerUsers(
    ownerId: number,
  ): Promise<User[]> {
    const transaction = await getTransaction(this.logger);
    const ownerUsers = await transaction.query<User[]>(
      'SELECT * FROM `User` WHERE ownerId = ?',
      [ownerId],
    );
    await transaction.commit();
    return ownerUsers;
  }

  async getUserById(
    id: number,
  ): Promise<User> {
    const transaction = await getTransaction(this.logger);
    const user = await UserHelpersService.getUserById(transaction, id);
    await transaction.commit();
    return user;
  }

  async updateUserAvatar(
    userId: number,
    avatarId: number,
  ): Promise<void> {
    const transaction = await getTransaction(this.logger);
    await transaction.query(
      'UPDATE `User` SET avatarId = ? WHERE id = ?',
      [avatarId, userId],
    );
    await transaction.commit();
  }
}

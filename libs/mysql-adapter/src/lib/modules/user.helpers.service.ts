import { OwnerRole, OwnerRoleDb, User } from '@angular-monorepo/entities';
import { Transaction } from '../mysql-adapter';

export class UserHelpersService {

  /**
   * Get user by ID using an existing transaction.
   * Used in: user.router, namespace, settle, payment-event controllers.
   * @throws Error if user not found
   */
  static async getUserById(
    transaction: Transaction,
    id: number,
  ): Promise<User> {
    const user = (await transaction.query<User[]>(
      'SELECT * FROM `User` WHERE id = ?',
      [id],
    ))[0];

    if (!user) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    return user;
  }

  /**
   * Get all users for a specific owner in a namespace using an existing transaction.
   * Used in: namespace controller.
   */
  static async getNamespaceOwnerUsers(
    transaction: Transaction,
    ownerId: number,
    namespaceId: number,
  ): Promise<User[]> {
    const ownerUsers = await transaction.query<User[]>(
      'SELECT * FROM `User` WHERE namespaceId = ? AND ownerId = ?',
      [namespaceId, ownerId],
    );
    return ownerUsers;
  }

  static async getOwnerRoles (
    transaction: Transaction,
    ownerId: number,
  ): Promise<OwnerRole[]> {
    const roles = await transaction.query<OwnerRoleDb[]>(`
    SELECT * FROM \`OwnerRole\`
    WHERE \`ownerId\` = ?`,
    [ownerId]);

    if (!roles || !roles.length)
      return [ OwnerRole.USER ];

    return roles.map(r => r.role);
  }

  static async isOwnerAdmin (
    transaction: Transaction,
    ownerId: number,
  ): Promise<boolean> {
    const roles = await UserHelpersService.getOwnerRoles(transaction, ownerId);

    return roles.includes(OwnerRole.ADMIN);
  }
}

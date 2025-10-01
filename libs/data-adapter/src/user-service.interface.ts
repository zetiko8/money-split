import { User } from '@angular-monorepo/entities';

export interface IUserService {
  getNamespaceOwnerUsers(
    ownerId: number,
    namespaceId: number,
  ): Promise<User[]>;

  getOwnerUsers(
    ownerId: number,
  ): Promise<User[]>;

  getUserById(
    id: number,
  ): Promise<User>;

  updateUserAvatar(
    userId: number,
    avatarId: number,
  ): Promise<void>;
}

import { User } from '@angular-monorepo/entities';
import { lastInsertId, query } from '../connection/connection';
import { insertSql, selectOneWhereSql } from '../connection/helper';
import { EntityPropertyType, UserEntity } from '../types';
import { OWNER_SERVICE } from './owners';

export async function createUser (
  name: string,
  namespaceId: number,
  ownerId: number,
): Promise<User> {

  const owner = await OWNER_SERVICE.getOwnerById(ownerId);

  await query(insertSql(
    'User',
    UserEntity,
    { name, ownerId, namespaceId, avatarId: owner.avatarId },
  ));

  const id = await lastInsertId();

  const user = await getUserById(id);

  return user;
}

async function getUserById (
  id: number,
) {
  return await selectOneWhereSql<User>(
    'User',
    'id',
    EntityPropertyType.ID,
    id,
    UserEntity,
  );
}

async function updateUserAvatar(
  userId: number,
  avatarId: number,
) {
  const updateSql = `
    UPDATE \`User\`
    SET avatarId = ${avatarId}
    WHERE id = ${userId}
  `;
  await query(updateSql);
}

export const USER_SERVICE = {
  createUser,
  getNamespaceOwnerUsers: async (
    ownerId: number,
    namespaceId: number,
  ) => {
    const ownerUsers = await query<User[]>(
      `
          SELECT * FROM \`User\` 
          WHERE namespaceId = ${namespaceId}
          AND ownerId = ${ownerId}
          `,
    );

    return ownerUsers;
  },
  getOwnerUsers: async (
    ownerId: number,
  ) => {
    const ownerUsers = await query<User[]>(
      `
          SELECT * FROM \`User\` 
          WHERE ownerId = ${ownerId}
          `,
    );

    return ownerUsers;
  },
  getUserById,
  updateUserAvatar,
};
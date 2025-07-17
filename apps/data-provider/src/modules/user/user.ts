import { User } from '@angular-monorepo/entities';
import { query } from '../../connection/connection';
import { selectOneWhereSql } from '../../connection/helper';
import { EntityPropertyType, UserEntity } from '../../types';

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
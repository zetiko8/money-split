import { User } from "@angular-monorepo/entities";
import { lastInsertId, query } from "../connection/connection";
import { insertSql, selectOneWhereSql } from "../connection/helper";
import { EntityPropertyType, UserEntity } from "../types";

export async function createUser (
    name: string,
    namespaceId: number,
    ownerId: number,
  ): Promise<User> {
  
    await query(insertSql(
      'User',
      UserEntity,
      { name, ownerId, namespaceId }
    ));
  
    const id = await lastInsertId();
  
    const user = await getUserById(id);
  
    return user;
  }

async function getUserById (
  id: number
) {
  return await selectOneWhereSql<User>(
    'User',
    'id',
    EntityPropertyType.ID,
    id,
    UserEntity,
  );
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
          `
      );

      return ownerUsers;
    },
    getUserById,
  }
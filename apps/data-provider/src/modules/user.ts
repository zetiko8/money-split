import { User } from "@angular-monorepo/entities";
import { lastInsertId, query } from "../connection/connection";
import { insertSql } from "../connection/helper";
import { UserEntity } from "../types";

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
  
    const user = await query<User>(`
      SELECT * FROM \`User\`
      WHERE \`id\` = ${id}`)
  
    return user;
  }
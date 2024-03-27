import { ERROR_CODE, Owner, RegisterOwnerPayload } from "@angular-monorepo/entities";
import { lastInsertId, query } from "../connection/connection";
import bcrypt from 'bcrypt';
import { insertSql } from "../connection/helper";
import { OwnerEntity } from "../types";
import { randomUUID } from "crypto";
import { AVATAR_SERVICE } from "./avatar";

async function getOwnerById (
  id: number
) {
  const owner = await query<Owner[]>(`
  SELECT * FROM \`Owner\`
  WHERE \`id\` = ${id}`);

  if (!owner.length)
    throw Error(ERROR_CODE.RESOURCE_NOT_FOUND);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (owner[0] as any).hash;

  return owner[0];
}

async function getOwnerByKey (
  key: string
) {
  const owner = await query<Owner[]>(`
  SELECT * FROM \`Owner\`
  WHERE \`key\` = "${key}"`);

  if (!owner.length)
    throw Error(ERROR_CODE.RESOURCE_NOT_FOUND);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (owner[0] as any).hash;

  return owner[0];
}

async function createOwner (
  data: RegisterOwnerPayload,
): Promise<Owner> {
  const sameName = await query<Owner[]>(`
  SELECT * FROM \`Owner\`
  WHERE \`username\` = "${data.username}"`);

  if (sameName.length)
    throw Error(ERROR_CODE.OWNER_USERNAME_ALREADY_EXISTS);

  const avatar = await AVATAR_SERVICE.createAvatar(
    data.avatarColor, data.avatarUrl,
  );

  const hash = await bcrypt.hash(data.password, 10);

  await query(insertSql(
    'Owner',
    OwnerEntity,
    { 
      key: randomUUID(),
      hash,
      username: data.username,
      avatarId: avatar.id,
    }
  ));

  const id = await lastInsertId();

  const owner = await query<Owner[]>(`
    SELECT * FROM \`Owner\`
    WHERE \`id\` = ${id}`);

  delete (owner[0] as any).hash;

  return owner[0];
}

async function updateOwnerAvatar(
  ownerId: number,
  avatarId: number,
) {
  const updateSql = `
    UPDATE \`Owner\`
    SET avatarId = ${avatarId}
    WHERE id = ${ownerId}
  `;
  await query(updateSql);
}

export const OWNER_SERVICE = {
    getOwnerById,
    getOwnerByKey,
    createOwner,
    updateOwnerAvatar,
}
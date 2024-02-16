import { ERROR_CODE, Owner } from "@angular-monorepo/entities";
import { query } from "../connection/connection"

async function deleteOwner(
    username: string
) {
    await query(
        `DELETE FROM Owner WHERE username = "${username}"`
    )
}

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

export const OWNER_SERVICE = {
    deleteOwner,
    getOwnerById,
    getOwnerByKey,
}
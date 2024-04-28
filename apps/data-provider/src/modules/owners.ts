import { ERROR_CODE, Owner, RegisterOwnerPayload } from '@angular-monorepo/entities';
import { query } from '../connection/connection';
import bcrypt from 'bcrypt';
import { errorSecondProcedure } from '../connection/helper';
import { randomUUID } from 'crypto';
import { appErrorWrap } from '../helpers';

async function getOwnerById (
  id: number,
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
  key: string,
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
  return await appErrorWrap('OWNER_SERVICE.createOwner', async () => {
    const hash = await bcrypt.hash(data.password, 10);
    const owner = await errorSecondProcedure<Owner>(
      `
        call createOwner(
          '${data.username}',
          '${hash}',
          '${data.avatarColor}',
          '${data.avatarUrl}',
          '${randomUUID()}'
        );
        `,
    );
    return owner;
  });
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
};
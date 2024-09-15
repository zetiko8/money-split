import { Owner, RegisterOwnerPayload } from '@angular-monorepo/entities';
import { query } from '../connection/connection';
import bcrypt from 'bcrypt';
import { errorSecondProcedure } from '../connection/helper';
import { randomUUID } from 'crypto';
import { appErrorWrap } from '../helpers';

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
          ${data.avatarColor ? `'${data.avatarColor}'` : 'NULL'},
          ${data.avatarUrl ? `'${data.avatarUrl}'` : 'NULL'},
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
  createOwner,
  updateOwnerAvatar,
};
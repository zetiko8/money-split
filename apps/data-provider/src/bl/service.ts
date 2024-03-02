import { query } from '../connection/connection';
import { ERROR_CODE, Owner } from '@angular-monorepo/entities';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function login (
  username: string,
  password: string,
): Promise<string> {
  const owners = await query<Owner[]>(`
  SELECT * FROM \`Owner\`
  WHERE \`username\` = "${username}"`);

  if (!owners.length)
    throw Error(ERROR_CODE.RESOURCE_NOT_FOUND);

  
  const hash = (owners[0] as any).hash;

  const comparison = await bcrypt.compare(password, hash);
  if (!comparison)
    throw Error(ERROR_CODE.UNAUTHORIZED);

  delete (owners[0] as any).hash;
  delete (owners[0] as any).avatarUrl;
  const token = await jwtSign(owners[0]);

  return token;
}

function jwtSign (data: any) {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      data, 
      'myprivatekey', 
      function(err, token) {
        if (err) return reject(err);
        else return resolve(token as string);
      }
    );
  })
}

export function decodeJwt (token: string) {
  return jwt.verify(
    token, 
    'myprivatekey',
  ) as {
    key: string,
    id: number,
    username: string,
    iat: number
  };
}


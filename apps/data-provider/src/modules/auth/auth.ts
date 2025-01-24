import { query } from '../../connection/connection';
import { ERROR_CODE, Owner } from '@angular-monorepo/entities';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ENVIRONMENT } from '../config';
import { Request } from 'express';
import { appError } from '../../helpers';

async function login (
  username: string,
  password: string,
): Promise<string> {
  const owners = await query<Owner[]>(`
  SELECT * FROM \`Owner\`
  WHERE \`username\` = "${username}"`);

  if (!owners.length)
    throw Error(ERROR_CODE.UNAUTHORIZED);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hash = (owners[0] as any).hash;

  const comparison = await bcrypt.compare(password, hash);
  if (!comparison)
    throw Error(ERROR_CODE.UNAUTHORIZED);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (owners[0] as any).hash;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (owners[0] as any).avatarUrl;
  const token = await jwtSign(owners[0]);

  return token;
}

function jwtSign (data: unknown) {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      data,
      ENVIRONMENT.secret,
      function(err, token) {
        if (err) return reject(err);
        else return resolve(token as string);
      },
    );
  });
}

function decodeJwt (token: string) {
  return jwt.verify(
    token,
    ENVIRONMENT.secret,
  ) as {
    key: string,
    id: number,
    username: string,
    iat: number
  };
}

export const AUTH_SERVICE = {
  login,
  decodeJwt,
  getOwnerFromToken: async (token: string) => {
    try {
      const decoded = AUTH_SERVICE.decodeJwt(token);
      const owner = (await query<Owner>(`
      SELECT * FROM \`Owner\`
      WHERE \`key\` = "${decoded.key}"
      `))[0];
      return owner;
    } catch (error) {
      throw Error(ERROR_CODE.UNAUTHORIZED);
    }
  },
  auth: async (
    request: Request,
  ) => {
    try {
      const token = request.headers.authorization
        .split('Bearer ')[1];
      const decoded = AUTH_SERVICE.decodeJwt(token);
      const owner = (await query<Owner>(`
      SELECT * FROM \`Owner\`
      WHERE \`key\` = "${decoded.key}"
      `))[0];
      return owner;
    } catch (error) {
      throw appError(
        ERROR_CODE.UNAUTHORIZED,
        'AUTH_SERVICE.auth',
        error,
      );
    }
  },
  noAuth: async (
    request: Request,
  ) => {
    /**
     * This function will still parse the token if it exists,
     * but will not throw error if there is not token
     */
    try {
      if (!request.headers.authorization) return;
      const token = request.headers.authorization
        .split('Bearer ')[1];
      const decoded = AUTH_SERVICE.decodeJwt(token);
      const owner = (await query<Owner>(`
      SELECT * FROM \`Owner\`
      WHERE \`key\` = "${decoded.key}"
      `))[0];
      return owner;
    } catch (error) {
      throw appError(
        ERROR_CODE.UNAUTHORIZED,
        'AUTH_SERVICE.auth',
        error,
      );
    }
  },
};

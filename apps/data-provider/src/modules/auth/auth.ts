import { query } from '../../connection/connection';
import { ERROR_CODE, Owner, OwnerRole, OwnerRoleDb } from '@angular-monorepo/entities';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ENVIRONMENT } from '../config';
import { Request } from 'express';
import { appError, LOGGER } from '../../helpers';
import { NAMESPACE_SERVICE } from '../namespace/namespace';
import { HelpersService } from '@angular-monorepo/mysql-adapter';

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

export async function getOwnerRoles (
  ownerId: number,
): Promise<OwnerRole[]> {
  const roles = await query<OwnerRoleDb[]>(`
  SELECT * FROM \`OwnerRole\`
  WHERE \`ownerId\` = ${ownerId}`);

  if (!roles || !roles.length)
    return [ OwnerRole.USER ];

  return roles.map(r => r.role);
}

export async function isOwnerAdmin (
  ownerId: number,
): Promise<boolean> {

  const roles = await getOwnerRoles(ownerId);

  return roles.includes(OwnerRole.ADMIN);
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

async function getOwnerFromRequest (
  request: Request,
) {
  const token = request.headers.authorization
    .split('Bearer ')[1];
  const decoded = AUTH_SERVICE.decodeJwt(token);
  return new HelpersService(LOGGER).getOwnerByKey(decoded.key);
}

export async function getOwnerFromToken(
  token: string,
): Promise<Owner> {
  try {
    const decoded = AUTH_SERVICE.decodeJwt(token);
    return new HelpersService(LOGGER).getOwnerByKey(decoded.key);
  } catch (error) {
    throw Error(ERROR_CODE.UNAUTHORIZED);
  }
}

export const AUTH_SERVICE = {
  login,
  decodeJwt,
  getOwnerFromToken,
  getOwnerFromRequest: async (request: Request) => {
    try {
      const token = request.headers.authorization
        .split('Bearer ')[1];
      const decoded = AUTH_SERVICE.decodeJwt(token);
      return new HelpersService(LOGGER).getOwnerByKey(decoded.key);
    } catch (error) {
      throw Error(ERROR_CODE.UNAUTHORIZED);
    }
  },
  auth: async (
    request: Request,
  ) => {
    try {
      const owner = await getOwnerFromRequest(request);
      if (
        request.params['ownerKey']
        && request.params['ownerKey'] !== owner.key
      ) throw Error(ERROR_CODE.UNAUTHORIZED);
      return owner;
    } catch (error) {
      throw appError(
        ERROR_CODE.UNAUTHORIZED,
        'AUTH_SERVICE.auth',
        error,
      );
    }
  },
  namespaceAuth: async (
    request: Request,
  ) => {
    const owner = await AUTH_SERVICE.auth(request);
    try {
      const ownerHasAccessToNamespace = await NAMESPACE_SERVICE.ownerHasAccessToNamespace(
        owner.id,
        Number(request.params['namespaceId']),
      );
      if (!ownerHasAccessToNamespace) throw Error(ERROR_CODE.UNAUTHORIZED);
      return owner;
    } catch (error) {
      throw appError(
        ERROR_CODE.UNAUTHORIZED,
        'AUTH_SERVICE.namespaceAuth',
        error,
      );
    }
  },
  backdoorAuth: async (
    request: Request,
  ) => {
    try {
      const owner = await getOwnerFromRequest(request);
      const isAdmin = await isOwnerAdmin(owner.id);
      if (!isAdmin) throw Error(ERROR_CODE.UNAUTHORIZED);
      return owner;
    } catch (error) {
      throw appError(
        ERROR_CODE.UNAUTHORIZED,
        'AUTH_SERVICE.backdoorAuth',
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
      return await getOwnerFromRequest(request);
    } catch (error) {
      throw appError(
        ERROR_CODE.UNAUTHORIZED,
        'AUTH_SERVICE.noAuth',
        error,
      );
    }
  },
};

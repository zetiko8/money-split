import { Logger } from '@angular-monorepo/utils';
import bcrypt from 'bcrypt';
import { LOGGER } from '../../helpers';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { ENVIRONMENT } from '../config';
import { getTransactionContext, HelpersService, Transaction } from '@angular-monorepo/mysql-adapter';
import { ERROR_CODE } from '@angular-monorepo/entities';

function decodeJwt (token: string) {
  return jwt.verify(
    token,
    ENVIRONMENT.secret(),
  ) as {
    key: string,
    id: number,
    username: string,
    iat: number
  };
}

function jwtSign (data: unknown) {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      data,
      ENVIRONMENT.secret(),
      function(err, token) {
        if (err) return reject(err);
        else return resolve(token as string);
      },
    );
  });
}

export class Authentication {
  constructor(
    private readonly logger: Logger,
  ) {}

  getPasswordHash(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  async getOwnerFromRequest (transaction: Transaction, request: Request) {
    try {
      const token = request.headers.authorization
        .split('Bearer ')[1];
      const decoded = decodeJwt(token);
      return await HelpersService.getOwnerByKey(transaction, decoded.key);
    } catch (error) {
      throw Error(ERROR_CODE.UNAUTHORIZED);
    }
  }

  async login (
    username: string,
    password: string,
  ): Promise<string> {
    const owner = await getTransactionContext({ logger: LOGGER }, async (transaction) => {
      return await HelpersService.getOwnerFromUsername(transaction, username);
    });

    if (!owner)
      throw Error(ERROR_CODE.UNAUTHORIZED);


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hash = (owner as any).hash;

    const comparison = await bcrypt.compare(password, hash);
    if (!comparison)
      throw Error(ERROR_CODE.UNAUTHORIZED);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (owner as any).hash;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (owner as any).avatarUrl;
    const token = await jwtSign(owner);

    return token;
  }
}

export const AUTHENTICATION = new Authentication(LOGGER);

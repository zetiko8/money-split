import { ERROR_CODE } from '@angular-monorepo/entities';
import { Request } from 'express';
import { appError, LOGGER } from '../../helpers';
import { getTransactionContext, UserHelpersService } from '@angular-monorepo/mysql-adapter';
import { AUTHENTICATION } from '../authentication/authentication';

export const AUTH_MIDDLEWARE = {
  backdoorAuth: async (
    request: Request,
  ) => {
    try {
      const { owner, isAdmin} = await getTransactionContext(
        { logger: LOGGER },
        async (transaction) => {
          const owner = await AUTHENTICATION.getOwnerFromRequest(transaction, request);
          const isAdmin = await UserHelpersService.isOwnerAdmin(transaction, owner.id);
          return { owner, isAdmin };
        },
      );
      if (!isAdmin) throw Error(ERROR_CODE.UNAUTHORIZED);
      return owner;
    } catch (error) {
      throw appError(
        ERROR_CODE.UNAUTHORIZED,
        'AUTH_MIDDLEWARE.backdoorAuth',
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
      const owner = await getTransactionContext(
        { logger: LOGGER },
        async (transaction) => {
          return await AUTHENTICATION.getOwnerFromRequest(transaction, request);
        },
      );
      return owner;
    } catch (error) {
      throw appError(
        ERROR_CODE.UNAUTHORIZED,
        'AUTH_MIDDLEWARE.noAuth',
        error,
      );
    }
  },
};

import { ERROR_CODE } from '@angular-monorepo/entities';
import { Request } from 'express';
import { appError, RequestScopedLogger } from '../../helpers';
import { getTransactionContext, NamespaceHelpersService, UserHelpersService } from '@angular-monorepo/mysql-adapter';
import { AUTHENTICATION } from '../authentication/authentication';
import { RequestWithId } from '../../middleware/request-id.middleware';

export const AUTH_MIDDLEWARE = {
  auth: async (
    request: Request,
  ) => {
    try {
      const requestId = (request as RequestWithId).requestId || 'UNKNOWN';
      const logger = new RequestScopedLogger(requestId);
      const owner = await getTransactionContext(
        { logger },
        async (transaction) => {
          return await AUTHENTICATION.getOwnerFromRequest(transaction, request);
        },
      );
      if (
        request.params['ownerKey']
        && request.params['ownerKey'] !== owner.key
      ) throw Error(ERROR_CODE.UNAUTHORIZED);
      return owner;
    } catch (error) {
      throw appError(
        ERROR_CODE.UNAUTHORIZED,
        'AUTH_MIDDLEWARE.auth',
        error,
      );
    }
  },
  namespaceAuth: async (
    request: Request,
  ) => {
    const requestId = (request as RequestWithId).requestId || 'UNKNOWN';
    const logger = new RequestScopedLogger(requestId);
    return await getTransactionContext(
      { logger },
      async (transaction) => {
        const owner = await AUTH_MIDDLEWARE.auth(request);
        try {
          const ownerHasAccessToNamespace = await NamespaceHelpersService.ownerHasAccessToNamespace(
            transaction,
            owner.id,
            Number(request.params['namespaceId']),
          );
          if (!ownerHasAccessToNamespace) throw Error(ERROR_CODE.UNAUTHORIZED);
          return owner;
        } catch (error) {
          throw appError(
            ERROR_CODE.UNAUTHORIZED,
            'AUTH_MIDDLEWARE.namespaceAuth',
            error,
          );
        }
      });
  },
  backdoorAuth: async (
    request: Request,
  ) => {
    try {
      const requestId = (request as RequestWithId).requestId || 'UNKNOWN';
      const logger = new RequestScopedLogger(requestId);
      const { owner, isAdmin} = await getTransactionContext(
        { logger },
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
      const requestId = (request as RequestWithId).requestId || 'UNKNOWN';
      const logger = new RequestScopedLogger(requestId);
      const owner = await getTransactionContext(
        { logger },
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
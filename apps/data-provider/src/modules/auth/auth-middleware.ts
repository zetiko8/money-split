import { ERROR_CODE, VALIDATE } from '@angular-monorepo/entities';
import { Request } from 'express';
import { appError, RequestScopedLogger } from '../../helpers';
import { getTransactionContext, NamespaceHelpersService, UserHelpersService } from '@angular-monorepo/mysql-adapter';
import { AUTHENTICATION } from '../authentication/authentication';
import { RequestWithId } from '../../middleware/request-id.middleware';
import { NUMBER } from '@angular-monorepo/data-adapter';

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
          VALIDATE.requiredNumber(NUMBER(request.params['namespaceId']));
          const ownerHasAccessToNamespace = await NamespaceHelpersService.ownerHasAccessToNamespace(
            transaction,
            owner.id,
            NUMBER(request.params['namespaceId']),
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
  /**
   * An action performed on a namespace by one user of the owner.
   *
   * Validates that the owner is authenticated.
   * Validates that the owner has access to the namespace.
   * Validates that the owner's user has access to the namespace.
   */
  namespaceByUserAuth: async (
    request: Request,
  ) => {
    const requestId = (request as RequestWithId).requestId || 'UNKNOWN';
    const logger = new RequestScopedLogger(requestId);
    return await getTransactionContext(
      { logger },
      async (transaction) => {
        logger.log('1');
        const owner = await AUTH_MIDDLEWARE.auth(request);
        try {
          const namespaceId = NUMBER(request.params['namespaceId']);
          VALIDATE.requiredNumber(namespaceId);
          const byUser = NUMBER(request.params['byUser']);
          VALIDATE.requiredNumber(byUser);

          logger.log('2');
          const ownerNamespacesWithOwnerUsers
            = await NamespaceHelpersService.getOwnerNamespacesWithOwnerUsers(
              transaction,
              owner.id,
            );

          logger.log('3');
          const namespace = ownerNamespacesWithOwnerUsers
            .find(namespace => namespace.id === namespaceId);
          if (!namespace) throw Error(ERROR_CODE.UNAUTHORIZED);
          const ownerHasAccessToNamespaceUser
            = namespace.ownerUsers.some(ownerUser => ownerUser.id === byUser);

          logger.log('4');
          if (!ownerHasAccessToNamespaceUser)
            throw Error(ERROR_CODE.UNAUTHORIZED);
          return owner;
        } catch (error) {
          throw appError(
            ERROR_CODE.UNAUTHORIZED,
            'AUTH_MIDDLEWARE.namespaceByUserAuth',
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
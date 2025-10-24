import { ERROR_CODE } from '@angular-monorepo/entities';
import { AppError } from '@angular-monorepo/express-lib';
import { RequestWithId } from './request-id.middleware';
import { RequestScopedLogger } from '../helpers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (err, req, res, next) => {

  const requestId = (req as RequestWithId).requestId || 'UNKNOWN';
  const logger = new RequestScopedLogger(requestId);

  logger.error(err.message);
  if (err.originalError) {
    const appError = err as AppError;
    logger.error(appError.originalError.message);
    appError.appStack.forEach(stack => {
      logger.error(' - ' + stack);
    });
  }
  if (err.context) {
    logger.error(err.context);
  }

  if (!err.originalError && !err.context) {
    logger.error(`FROM: ${req.method} ${req.url}`);
    logger.error(err.stack);
  }
  if (Object.values(ERROR_CODE).includes(err.message)) {
    res.status(400);
  } else {
    res.status(500);
  }

  return res.json({
    error: err.message,
  });
};

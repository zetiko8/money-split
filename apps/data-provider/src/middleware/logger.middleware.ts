import { Logger } from '@angular-monorepo/utils';
import { RequestHandler } from 'express';
import { RequestWithId } from './request-id.middleware';
import { RequestScopedLogger } from '../helpers';

export async function logRequest (
  LOGGER: Logger,
  endpoint: string,
  method: string,
  payload: unknown,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const json = JSON.stringify(payload);
  LOGGER.log(endpoint, method);
  // console.log(endpoint, method, payload);

  // const sql =             `
  //       INSERT INTO Request
  //       (\`method\`, payload)
  //       VALUES('${method}', '${json}');
  //       `;

  // await query(sql);
}

export const logRequestMiddleware = (
  method: string,
) => {
  const mw: RequestHandler = async (
    req, res, next,
  ) => {
    // Create request-scoped logger
    const requestId = (req as RequestWithId).requestId || 'UNKNOWN';
    const logger = new RequestScopedLogger(requestId);
    try {
      await logRequest(logger, req.url, method, req.body);

      next();
    } catch (error) {
      next(error);
    }
  };

  return mw;
};


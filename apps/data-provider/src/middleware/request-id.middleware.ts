import { Request, RequestHandler } from 'express';
import { randomUUID } from 'crypto';

export const REQUEST_ID_HEADER = 'X-Request-ID';

export interface RequestWithId extends Request {
  requestId?: string;
}

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  // Generate or use existing request ID
  const requestId = req.headers[REQUEST_ID_HEADER.toLowerCase()] as string
    || `REQ-${randomUUID().substring(0, 8)}`;

  // Store in request object for access throughout the request lifecycle
  (req as RequestWithId).requestId = requestId;

  // Echo back in response headers
  res.setHeader(REQUEST_ID_HEADER, requestId);

  next();
};

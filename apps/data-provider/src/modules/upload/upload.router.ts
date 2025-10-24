import { Router } from 'express';
import { UPLOAD_SERVICE } from './upload';
import { TypedRequestBody } from '../../types';
import { logRequestMiddleware } from '../../middleware/logger.middleware';

export const uploadRouter = Router();

uploadRouter.post('/upload',
  logRequestMiddleware( '/upload'),
  UPLOAD_SERVICE.upload.single('file'),
  async (
    req: TypedRequestBody<{ name: string }>,
    res,
    next,
  ) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res.json({ url: (req as any).file.filename });
    } catch (error) {
      next(error);
    }
  });

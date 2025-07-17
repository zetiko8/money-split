import { Router } from 'express';
import { RECORD_SERVICE } from './record';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { registerRoute } from '../../helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { TypedRequestBody } from '../../types';
import { logRequestMiddleware } from '../../request/service';

import { RecordData } from '@angular-monorepo/entities';
import {
  addRecordApi,
  addRecordApiBackdoor,
} from '@angular-monorepo/api-interface';

export const recordRouter = Router();

registerRoute(
  addRecordApi(),
  recordRouter,
  async (payload, params, context) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.benefitors) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.benefitors.length)
      throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.benefitors.every(b => Number.isInteger(b)))
      throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.paidBy) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.paidBy.length) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.paidBy.every(b => Number.isInteger(b)))
      throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.cost) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (typeof payload.cost !== 'number')
      throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.currency)
      throw Error(ERROR_CODE.INVALID_REQUEST);
    if (typeof payload.currency !== 'string')
      throw Error(ERROR_CODE.INVALID_REQUEST);
    return await await RECORD_SERVICE.addRecord(
      Number(params.namespaceId),
      Number(params.userId),
      payload,
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  addRecordApiBackdoor(),
  recordRouter,
  async (payload, params) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.benefitors) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.benefitors.length)
      throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.benefitors.every(b => Number.isInteger(b)))
      throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.paidBy) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.paidBy.length) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.paidBy.every(b => Number.isInteger(b)))
      throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.cost) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (typeof payload.cost !== 'number')
      throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.currency)
      throw Error(ERROR_CODE.INVALID_REQUEST);
    if (typeof payload.currency !== 'string')
      throw Error(ERROR_CODE.INVALID_REQUEST);
    return await RECORD_SERVICE.addRecordBackdoor(
      Number(params.namespaceId),
      payload,
    );
  },
  AUTH_SERVICE.backdoorAuth,
);

recordRouter.post(
  '/:ownerKey/namespace/:namespaceId/:userId/edit/record/:recordId',
  logRequestMiddleware('POST edit record'),
  async (
    req: TypedRequestBody<RecordData>,
    res,
    next,
  ) => {
    try {
      await AUTH_SERVICE.getOwnerFromRequest(req);

      const recordId = Number(req.params['recordId'] as string);
      const record = await RECORD_SERVICE.editRecord(
        Number(req.params['userId']),
        recordId,
        req.body,
      );

      res.json(record);
    } catch (error) {
      next(error);
    }
  });

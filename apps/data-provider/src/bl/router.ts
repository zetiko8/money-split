import { Router, Request } from 'express';
import { logRequestMiddleware } from '../request/service';
import { TypedRequestBody } from '../types';
import { query } from '../connection/connection';
import { ERROR_CODE, EditProfileData, MNamespace, Owner, RecordData, RecordView, SettlePayload } from '@angular-monorepo/entities';
import { INVITATION_SERVICE } from '../modules/invitation';
import { RECORD_SERVICE } from '../modules/record';
import { NAMESPACE_SERVICE } from '../modules/namespace';
import { OWNER_SERVICE } from '../modules/owners';
import { AVATAR_SERVICE } from '../modules/avatar';
import { PROFILE_SERVICE } from '../modules/profile';
import { VALIDATE, asyncMap, numberRouteParam, registerRoute } from '../helpers';
import { SETTLE_SERVICE } from '../modules/settle';
import multer from 'multer';
import path from 'path';
import {
  acceptInvitationApi,
  addRecordApi,
  createInvitationApi,
  createNamespaceApi,
  getInvitationViewApi,
  getNamespaceViewApi,
  getOwnerNamespacesApi,
  getOwnerProfileApi,
  loginApi,
  registerApi,
} from '@angular-monorepo/api-interface';
import { AUTH_SERVICE } from '../modules/auth/auth';

export const mainRouter = Router();

registerRoute(
  createNamespaceApi(),
  mainRouter,
  async (payload, params, context) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.namespaceName) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (
      !payload.avatarColor && !payload.avatarUrl
    ) throw Error(ERROR_CODE.INVALID_REQUEST);

    return await NAMESPACE_SERVICE.createNamespace(
      payload, context.owner);
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  getOwnerProfileApi(),
  mainRouter,
  async (payload, params, context) => {
    return await PROFILE_SERVICE.getProfile(
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

mainRouter.post('/:ownerKey/profile',
  logRequestMiddleware('POST profile'),
  async (
    req: TypedRequestBody<EditProfileData>,
    res,
    next,
  ) => {
    try {
      const owner = await getOwnerFromToken(req);

      const profile = await PROFILE_SERVICE.editProfile(
        owner.id,
        req.body,
      );

      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

mainRouter.get('/avatar/:avatarId',
  logRequestMiddleware('GET avatar'),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      const avatar = await AVATAR_SERVICE.getById(
        Number(req.params['avatarId'] as string),
      );

      res.json(avatar);
    } catch (error) {
      next(error);
    }
  });

mainRouter.get('/avatar',
  logRequestMiddleware('GET avatar'),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      const queryParams = (req.query['avatarIds'] as string[]);

      const ids = Array.isArray(queryParams)
        ? queryParams.map(id => Number(id))
        : [Number(queryParams)];

      const avatarDatas = await asyncMap(ids, async (id) => {
        return await AVATAR_SERVICE.getById(id);
      });

      res.json(avatarDatas);
    } catch (error) {
      next(error);
    }
  });

registerRoute(
  getNamespaceViewApi(),
  mainRouter,
  async (payload, params, context) => {

    return await NAMESPACE_SERVICE.getNamespaceViewForOwner(
      Number(params.namespaceId),
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

mainRouter.get(
  '/:ownerKey/namespace/:namespaceId/edit/record/:recordId',
  logRequestMiddleware('GET edit record'),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      const owner = await getOwnerFromToken(req);

      const recordId = Number(req.params['recordId'] as string);

      const mNamaespace = await NAMESPACE_SERVICE.getNamespaceViewForOwner(
        Number(req.params['namespaceId'] as string),
        owner.id,
      );

      const record = await RECORD_SERVICE
        .getRecordById(recordId);

      const editRecordView: {
        namespace: MNamespace,
        record: RecordView,
      } = {
        namespace: mNamaespace,
        record: (await NAMESPACE_SERVICE.mapToRecordView(
          record,
          mNamaespace,
        )),
      };

      res.json(editRecordView);
    } catch (error) {
      next(error);
    }
  });

mainRouter.post(
  '/:ownerKey/namespace/:namespaceId/:userId/edit/record/:recordId',
  logRequestMiddleware('POST edit record'),
  async (
    req: TypedRequestBody<RecordData>,
    res,
    next,
  ) => {
    try {
      await getOwnerFromToken(req);

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

registerRoute(
  getOwnerNamespacesApi(),
  mainRouter,
  async (payload, params, context) => {
    return await NAMESPACE_SERVICE.getNamespacesForOwner(
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  createInvitationApi(),
  mainRouter,
  async (payload, params, context) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.email) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (typeof payload.email !== 'string') throw Error(ERROR_CODE.INVALID_REQUEST);
    return await INVITATION_SERVICE.inviteToNamespace(
      payload.email,
      Number(params.namespaceId),
      context.owner.id,
    );
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  addRecordApi(),
  mainRouter,
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

mainRouter.get('/:ownerKey/namespace/:namespaceId/settle/preview',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      const owner = await getOwnerFromToken(req);

      const settlmentPreview = await SETTLE_SERVICE
        .settleNamespacePreview(
          numberRouteParam(req, 'namespaceId'),
          owner.id,
        );

      res.json(settlmentPreview);
    } catch (error) {
      next(error);
    }
  });

mainRouter.post('/:ownerKey/namespace/:namespaceId/settle/confirm/:byUser',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<SettlePayload>,
    res,
    next,
  ) => {
    try {
      await getOwnerFromToken(req);

      const result = await SETTLE_SERVICE
        .settle(
          numberRouteParam(req, 'byUser'),
          numberRouteParam(req, 'namespaceId'),
          req.body.records,
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

mainRouter.get('/:ownerKey/namespace/:namespaceId/settle/mark-as-settled/:byUser/:settlementDebtId',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      await getOwnerFromToken(req);

      const result = await SETTLE_SERVICE
        .setDebtIsSettled(
          numberRouteParam(req, 'byUser'),
          numberRouteParam(req, 'settlementDebtId'),
          true,
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

mainRouter.get('/:ownerKey/namespace/:namespaceId/settle/mark-as-unsettled/:byUser/:settlementDebtId',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      await getOwnerFromToken(req);

      const result = await SETTLE_SERVICE
        .setDebtIsSettled(
          numberRouteParam(req, 'byUser'),
          numberRouteParam(req, 'settlementDebtId'),
          false,
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

registerRoute(
  loginApi(),
  mainRouter,
  async (payload) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.username) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.password) throw Error(ERROR_CODE.INVALID_REQUEST);

    const token =
        await AUTH_SERVICE.login(payload.username, payload.password);
    return { token };
  },
);

registerRoute(
  registerApi(),
  mainRouter,
  async (payload) => {
    VALIDATE.requiredPayload(payload);
    VALIDATE.requiredString(payload.username);
    VALIDATE.requiredString(payload.password);
    VALIDATE.string(payload.avatarColor);
    VALIDATE.string(payload.avatarUrl);
    VALIDATE.anyOf(payload.avatarColor, payload.avatarUrl);

    return await OWNER_SERVICE.createOwner(payload);
  },
);

registerRoute(
  getInvitationViewApi(),
  mainRouter,
  async (payload, params) => {
    return await INVITATION_SERVICE.getInvitationViewData(
      params.invitationKey,
    );
  },
  AUTH_SERVICE.auth,
);

registerRoute(
  acceptInvitationApi(),
  mainRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    VALIDATE.requiredString(payload.name);

    return await INVITATION_SERVICE.acceptInvitation(
      params.invitationKey,
      context.owner,
      payload.name,
    );
  },
  AUTH_SERVICE.auth,
);

const multerStorage = multer.diskStorage({
  destination: (
    req, file, cb,
  ) => {
    cb(null, path.join(__dirname, 'assets'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix
      = Date.now()
        + '-' + Math.round(Math.random() * 1E9);
    cb(
      null,
      uniqueSuffix + '.' +
      file.originalname.split('.')[1],
    );
  },
});
const upload = multer({
  storage: multerStorage,
});

mainRouter.post('/upload',
  logRequestMiddleware(),
  upload.single('file'),
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

async function getOwnerFromToken (
  req: Request,
): Promise<Owner> {
  try {
    const token = req.headers.authorization.split('Bearer ')[1];
    const decoded = AUTH_SERVICE.decodeJwt(token);
    const owner = (await query<Owner>(`
    SELECT * FROM \`Owner\`
    WHERE \`key\` = "${decoded.key}"
    `))[0];
    return owner;
  } catch (error) {
    throw Error(ERROR_CODE.UNAUTHORIZED);
  }
}
import { Router, Request } from 'express';
import { logRequestMiddleware } from '../request/service';
import { TypedRequestBody } from '../types';
import { query } from '../connection/connection';
import { ERROR_CODE, EditProfileData, MNamespace, Owner, RecordData, RecordView, RegisterOwnerPayload, SettlePayload } from '@angular-monorepo/entities';
import { INVITATION_SERVICE } from '../modules/invitation';
import { createUser } from '../modules/user';
import { RECORD_SERVICE } from '../modules/record';
import { NAMESPACE_SERVICE } from '../modules/namespace';
import { OWNER_SERVICE } from '../modules/owners';
import { AVATAR_SERVICE } from '../modules/avatar';
import { PROFILE_SERVICE } from '../modules/profile';
import { asyncMap, numberRouteParam, parseNumberRouteParam, registerRoute } from '../helpers';
import { SETTLE_SERVICE } from '../modules/settle';
import multer from 'multer';
import path from 'path';
import {
  createNamespaceApi,
  getNamespaceViewApi,
  getOwnerProfileApi,
  loginApi,
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
      parseNumberRouteParam(params.namespaceId),
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

mainRouter.get('/:ownerKey/namespace',
  logRequestMiddleware('GET namespaces'),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      const owner = (await query<Owner>(`
      SELECT * FROM \`Owner\`
      WHERE \`key\` = "${req.params['ownerKey'] as string}"
      `))[0];

      const mNamaespaces = await NAMESPACE_SERVICE.getNamespacesForOwner(
        owner.id,
      );

      res.json(mNamaespaces);
    } catch (error) {
      next(error);
    }
  });

mainRouter.post('/:ownerKey/namespace/:namespaceId/user',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<{ name: string }>,
    res,
    next,
  ) => {
    try {
      const owner = (await query<Owner>(`
    SELECT * FROM \`Owner\`
    WHERE \`key\` = "${req.params['ownerKey'] as string}"
    `))[0];
      const mNamaespace = await createUser(
        req.body.name,
        Number(req.params['namespaceId'] as string),
        owner.id,
      );
      res.json(mNamaespace);
    } catch (error) {
      next(error);
    }
  });

mainRouter.post('/:ownerKey/namespace/:namespaceId/invite',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<{ email: string }>,
    res,
    next,
  ) => {
    try {
      const owner = (await query<Owner>(`
    SELECT * FROM \`Owner\`
    WHERE \`key\` = "${req.params['ownerKey'] as string}"
    `))[0];

      const mNamaespace = await INVITATION_SERVICE.inviteToNamespace(
        req.body.email,
        Number(req.params['namespaceId'] as string),
        owner.id,
      );

      res.json(mNamaespace);
    } catch (error) {
      next(error);
    }
  });

mainRouter.post('/:ownerKey/namespace/:namespaceId/:userId/add',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<RecordData>,
    res,
    next,
  ) => {
    try {
      await getOwnerFromToken(req);
      const record = await RECORD_SERVICE.addRecord(
        Number(req.params['namespaceId'] as string),
        Number(req.params['userId']),
        req.body,
      );

      res.json(record);
    } catch (error) {
      next(error);
    }
  });

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

mainRouter.post('/register',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<RegisterOwnerPayload>,
    res,
    next,
  ) => {
    try {
      const owner = await OWNER_SERVICE.createOwner(
        req.body,
      );

      res.json(owner);
    } catch (error) {
      next(error);
    }
  });

mainRouter.get('/invitation/:invitationKey',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      const invitation = await INVITATION_SERVICE.getInvitationViewData(
        req.params['invitationKey'] as string,
      );
      res.json(invitation);
    } catch (error) {
      next(error);
    }
  });

mainRouter.post('/invitation/:invitationKey/accept',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<{ name: string }>,
    res,
    next,
  ) => {
    try {

      const owner = await getOwnerFromToken(req);
      const invitation = await INVITATION_SERVICE.acceptInvitation(
        req.params['invitationKey'] as string,
        owner,
        req.body.name,
      );

      res.json(invitation);
    } catch (error) {
      next(error);
    }
  });

mainRouter.post('/invitation/:invitationKey/accept',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<{ name: string }>,
    res,
    next,
  ) => {
    try {

      const owner = await getOwnerFromToken(req);
      const invitation = await INVITATION_SERVICE.acceptInvitation(
        req.params['invitationKey'] as string,
        owner,
        req.body.name,
      );

      res.json(invitation);
    } catch (error) {
      next(error);
    }
  });

const multerStorage = multer.diskStorage({
  destination: (
    req, file, cb,
  ) => {
    cb(null, path.join(__dirname, 'assets'));
  },
  filename: function (req, file, cb) {
    console.log(file);
    const uniqueSuffix
      = Date.now()
        + '-' + Math.round(Math.random() * 1E9);
    console.log(
      file.originalname.split('.')[1],
    );
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
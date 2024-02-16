import { Router, Request } from 'express';
import { logRequestMiddleware } from '../request/service';
import { TypedRequestBody } from '../types';
import { createOwner, decodeJwt, getNamespacesForOwner, login } from './service';
import { query } from '../connection/connection';
import { ERROR_CODE, Owner, RecordData } from '@angular-monorepo/entities';
import { INVITATION_SERVICE } from '../modules/invitation';
import { createUser } from '../modules/user';
import { RECORD_SERVICE } from '../modules/record';
import { NAMESPACE_SERVICE } from '../modules/namespace';

export const mainRouter = Router();

mainRouter.post('/:ownerKey/namespace',
  logRequestMiddleware('POST namespace'),
  async (
    req: TypedRequestBody<{ name: string }>,
    res,
    next,
  ) => {
    try {
      const owner = await getOwnerFromToken(req);

      const mNamaespace = await NAMESPACE_SERVICE.createNamespace(
        req.body.name, owner);

      res.json(mNamaespace);
    } catch (error) {
      next(error);
    }
  });

mainRouter.get('/:ownerKey/namespace/:namespaceId',
  logRequestMiddleware('GET namespace'),
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

      const mNamaespace = await NAMESPACE_SERVICE.getNamespaceViewForOwner(
        Number(req.params['namespaceId'] as string),
        owner.id,
      );

      res.json(mNamaespace);
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

      const mNamaespaces = await getNamespacesForOwner(
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
    const owner = await getOwnerFromToken(req);
    const record = await RECORD_SERVICE.addRecord(
      Number(req.params['namespaceId'] as string),
      Number(req.params['userId']),
      req.body,
    )

    res.json(record);
  } catch (error) {
    next(error);
  }
});

mainRouter.post('/login',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<{
      username: string,
      password: string,
    }>,
    res,
    next,
  ) => {
    try {

      const token = await login
        (req.body.username, req.body.password);

      res.json({ token });
    } catch (error) {
      next(error);
    }
  });

mainRouter.post('/register',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<{
      username: string,
      password: string,
    }>,
    res,
    next,
  ) => {
    try {
      const owner = await createOwner(
        req.body.username,
        req.body.password,
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
        req.params['invitationKey'] as string
      )
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

async function getOwnerFromToken (
  req: Request,
) {
  try {
    const token = req.headers.authorization.split('Bearer ')[1];
    const decoded = decodeJwt(token);
    const owner = (await query<Owner>(`
    SELECT * FROM \`Owner\`
    WHERE \`key\` = "${decoded.key}"
    `))[0];
    return owner;    
  } catch (error) {
    throw Error(ERROR_CODE.UNAUTHORIZED);
  }
}
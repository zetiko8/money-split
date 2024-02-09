import { Router, Request } from 'express';
import { logRequestMiddleware } from '../request/service';
import { TypedRequestBody } from '../types';
import { createNamespace, createOwner, decodeJwt, getNamespaceViewForOwner, getNamespacesForOwner, inviteToNamespace, login } from './service';
import { query } from '../connection/connection';
import { Owner } from '@angular-monorepo/entities';
import { acceptInvitation, getInvitationViewData } from '../modules/invitation';
import { createUser } from '../modules/user';

export const mainRouter = Router();

mainRouter.post('/:ownerKey/namespace',
  logRequestMiddleware('POST namespace'),
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

      const mNamaespace = await createNamespace(
        req.body.name, owner.id);

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

      const mNamaespace = await getNamespaceViewForOwner(
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

    const mNamaespace = await inviteToNamespace(
      req.body.email,
      Number(req.params['namespaceId'] as string),
      owner.id,
    );

    res.json(mNamaespace);
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
      const invitation = await getInvitationViewData(
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
      const invitation = await acceptInvitation(
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
  const token = req.headers.authorization.split('Bearer ')[1];
  const decoded = decodeJwt(token);
  const owner = (await query<Owner>(`
  SELECT * FROM \`Owner\`
  WHERE \`key\` = "${decoded.key}"
  `))[0];
  return owner;
}
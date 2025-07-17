import { Router } from 'express';
import { logRequestMiddleware } from '../../request/service';
import { TypedRequestBody } from '../../types';
import { NAMESPACE_SERVICE } from '../namespace/namespace';
import { INVITATION_SERVICE } from '../invitation/invitation';
import { CYBACKDOOR_SERVICE } from './cybackdoor.service';
import { stringRouteParam } from '../../helpers';
import { RecordDataCy } from '@angular-monorepo/entities';
import { query } from '../../connection/connection';

export const cyBackdoorRouter = Router();

cyBackdoorRouter.delete('/owner/:username',
  logRequestMiddleware('CYBACKDOOR - DELETE owner'),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {

      await CYBACKDOOR_SERVICE.deleteOwner(req.params['username'] as string);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

cyBackdoorRouter.delete('/user/:username',
  logRequestMiddleware('CYBACKDOOR - DELETE user'),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {

      await CYBACKDOOR_SERVICE
        .deleteUser(req.params['username'] as string);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

cyBackdoorRouter.delete('/namespace/:namespaceId',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {

      await NAMESPACE_SERVICE
        .deleteNamespace(
          Number(req.params['namespaceId'] as string));

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

cyBackdoorRouter.delete('/namespaceName/:namespaceName',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {

      await CYBACKDOOR_SERVICE
        .deleteNamespaceByName(
            req.params['namespaceName'] as string);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

cyBackdoorRouter.delete('/invitation/:email',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {

      await CYBACKDOOR_SERVICE
        .deleteInvitationByEmail(
            req.params['email'] as string);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

cyBackdoorRouter.post('/invitation/accept',
  logRequestMiddleware('CYBACKDOOR - acceptInvitation'),
  async (
    req: TypedRequestBody<{
      name: string,
      email: string,
      ownerUsername: string,
    }>,
    res,
    next,
  ) => {
    try {

      const owner
        = await CYBACKDOOR_SERVICE.getOwnerByUsername(req.body.ownerUsername);
      const invitation
        = await CYBACKDOOR_SERVICE.getInvitationByEmail(req.body.email);
      await INVITATION_SERVICE.acceptInvitation(
        invitation.invitationKey,
        owner,
        req.body.name,
      );

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

cyBackdoorRouter.post('/record/:namespaceName/:createdByUsername',
  logRequestMiddleware('CYBACKDOOR - acceptInvitation'),
  async (
    req: TypedRequestBody<RecordDataCy>,
    res,
    next,
  ) => {
    try {
      const namespace = await CYBACKDOOR_SERVICE
        .getNamespaceByName(stringRouteParam(req, 'namespaceName'));
      const createdBy = await CYBACKDOOR_SERVICE
        .getUserByUsername(stringRouteParam(req, 'createdByUsername'));

      const record = await CYBACKDOOR_SERVICE.addRecord(
        namespace.id,
        createdBy.id,
        req.body,
      );

      res.json(record);
    } catch (error) {
      next(error);
    }
  });

cyBackdoorRouter.post('/settle/:namespaceName/:byUsername',
  logRequestMiddleware('CYBACKDOOR - acceptInvitation'),
  async (
    req: TypedRequestBody<{
      records: number[],
      settledOn: Date,
    }>,
    res,
    next,
  ) => {
    try {
      const result = await CYBACKDOOR_SERVICE
        .settleRecords(
          stringRouteParam(req, 'byUsername'),
          stringRouteParam(req, 'namespaceName'),
          req.body.records,
          new Date(req.body.settledOn),
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

cyBackdoorRouter.post('/sql',
  logRequestMiddleware('CYBACKDOOR - sql'),
  async (
    req: TypedRequestBody<{
      sql: string,
    }>,
    res,
    next,
  ) => {
    try {
      const result = await query(req.body.sql);

      res.json(result);
    } catch (error) {
      console.log('FAILED BACKDOOR QUERY');
      console.log(req.body.sql);
      next(error);
    }
  });
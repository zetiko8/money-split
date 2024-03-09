import { Router } from "express";
import { logRequestMiddleware } from "../../request/service";
import { TypedRequestBody } from "../../types";
import { OWNER_SERVICE } from "../owners";
import { NAMESPACE_SERVICE } from "../namespace";
import { INVITATION_SERVICE } from "../invitation";
import { CYBACKDOOR_SERVICE } from "./cybackdoor.service";
import { RECORD_SERVICE } from "../record";
import { asyncMap, stringRouteParam } from "../../helpers";
import { RecordData, RecordDataCy } from "@angular-monorepo/entities";

export const cyBackdoorRouter = Router();

cyBackdoorRouter.delete('/owner/:username',
  logRequestMiddleware(),
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

cyBackdoorRouter.post('/:ownerKey/namespace',
  logRequestMiddleware('POST namespace'),
  async (
    req: TypedRequestBody<{ name: string }>,
    res,
    next,
  ) => {
    try {
      const owner = await OWNER_SERVICE
        .getOwnerByKey(
          req.params['ownerKey'] as string
        );
      const mNamaespace = await NAMESPACE_SERVICE.createNamespace(
        req.body.name, owner);
      res.json(mNamaespace);
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
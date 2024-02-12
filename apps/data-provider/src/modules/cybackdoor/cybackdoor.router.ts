import { Router } from "express";
import { logRequestMiddleware } from "../../request/service";
import { TypedRequestBody } from "../../types";
import { OWNER_SERVICE } from "../owners";
import { NAMESPACE_SERVICE } from "../namespace";
import { INVITATION_SERVICE } from "../invitation";

export const cyBackdoorRouter = Router();

cyBackdoorRouter.delete('/owner/:username',
  logRequestMiddleware(),
  async (
    req: TypedRequestBody<null>,
    res,
    next,
  ) => {
    try {
      
        await OWNER_SERVICE.deleteOwner(req.params['username'] as string);

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
      
        await NAMESPACE_SERVICE
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
      
        await INVITATION_SERVICE
          .deleteInvitationByEmail(
            req.params['email'] as string);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
import { Router } from "express";
import { logRequestMiddleware } from "../../request/service";
import { TypedRequestBody } from "../../types";
import { query } from "../../connection/connection";
import { OWNER_SERVICE } from "../owners";

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
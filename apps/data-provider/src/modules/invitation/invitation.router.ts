import { Router } from 'express';
import { INVITATION_SERVICE } from './invitation';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { VALIDATE, registerRoute } from '../../helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import {
  acceptInvitationApi,
  createInvitationApi,
  getInvitationViewApi,
} from '@angular-monorepo/api-interface';

export const invitationRouter = Router();

registerRoute(
  createInvitationApi(),
  invitationRouter,
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
  getInvitationViewApi(),
  invitationRouter,
  async (payload, params) => {
    return await INVITATION_SERVICE.getInvitationViewData(
      params.invitationKey,
    );
  },
  AUTH_SERVICE.noAuth,
);

registerRoute(
  acceptInvitationApi(),
  invitationRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    VALIDATE.requiredString(payload.name);

    payload.name = payload.name.trim();
    return await INVITATION_SERVICE.acceptInvitation(
      params.invitationKey,
      context.owner,
      payload.name,
    );
  },
  AUTH_SERVICE.auth,
);

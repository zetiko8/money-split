import { Router } from 'express';
import { INVITATION_SERVICE } from './invitation';
import { AUTH_SERVICE } from '../../modules/auth/auth';
import { LOGGER, registerRoute } from '../../helpers';
import { ERROR_CODE, VALIDATE } from '@angular-monorepo/entities';
import {
  acceptInvitationApi,
  createInvitationApi,
  getInvitationViewApi,
} from '@angular-monorepo/api-interface';
import { InvitationService } from '@angular-monorepo/mysql-adapter';
import { sendMail } from '../email/mock-email';

export const invitationRouter = Router();

registerRoute(
  createInvitationApi(),
  invitationRouter,
  async (payload, params, context) => {
    if (!payload) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (!payload.email) throw Error(ERROR_CODE.INVALID_REQUEST);
    if (typeof payload.email !== 'string') throw Error(ERROR_CODE.INVALID_REQUEST);
    return await new InvitationService(LOGGER).inviteToNamespace(
      payload.email,
      Number(params.namespaceId),
      context.owner.id,
      async (invitationKey) => {
        await sendMail({
          subject: 'Invitation to Money Split Group',
          text: `
                <h1>
                  Your friend has invited you to join a group.
                </h1>
                <p>
                  Follow the link bellow to join.
                </p>
                <a href="http://localhost:4200/invitation/${invitationKey}/join">Link</a>
              `,
          to: payload.email,
        });
      },
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

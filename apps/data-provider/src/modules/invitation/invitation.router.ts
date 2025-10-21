import { Router } from 'express';
import { AUTH_MIDDLEWARE} from '../../modules/auth/auth-middleware';
import { LOGGER, registerRoute } from '../../helpers';
import { VALIDATE } from '@angular-monorepo/entities';
import {
  acceptInvitationApi,
  createInvitationApi,
  getInvitationViewApi,
} from '@angular-monorepo/api-interface';
import { InvitationService } from '@angular-monorepo/mysql-adapter';
import { sendMail } from '../email/mock-email';
import { body } from 'express-validator';

export const invitationRouter = Router();

// Helper function to validate invitation acceptance in database
async function validateAcceptInvitation(
  invitationKey: string,
  ownerId: number,
  name: string,
) {
  await new InvitationService(LOGGER).acceptInvitationValidation(
    invitationKey,
    ownerId,
    name,
  );
}

registerRoute(
  createInvitationApi(),
  invitationRouter,
  async (payload, params, context) => {
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
  AUTH_MIDDLEWARE.namespaceAuth,
  [ body('email')
    .isString()
    .trim().escape()
    .isEmail()],
);

registerRoute(
  getInvitationViewApi(),
  invitationRouter,
  async (payload, params) => {
    return await new InvitationService(LOGGER).getInvitationViewData(
      params.invitationKey,
    );
  },
  AUTH_MIDDLEWARE.noAuth,
);

registerRoute(
  acceptInvitationApi(),
  invitationRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    VALIDATE.userName(payload.name);

    payload.name = payload.name.trim();

    // Run database validation (invitation status, duplicate names, owner already in namespace)
    await validateAcceptInvitation(
      params.invitationKey,
      context.owner.id,
      payload.name,
    );

    return await new InvitationService(LOGGER).acceptInvitation(
      params.invitationKey,
      context.owner.id,
      payload.name,
    );
  },
  AUTH_MIDDLEWARE.auth,
);

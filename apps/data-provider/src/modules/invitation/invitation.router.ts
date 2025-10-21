import { Router } from 'express';
import { AUTH_MIDDLEWARE} from '../../modules/auth/auth-middleware';
import { LOGGER, registerRoute, throwValidationError } from '../../helpers';
import { VALIDATE } from '@angular-monorepo/entities';
import {
  acceptInvitationApi,
  createInvitationApi,
  getInvitationViewApi,
} from '@angular-monorepo/api-interface';
import { InvitationService } from '@angular-monorepo/mysql-adapter';
import { sendMail } from '../email/mock-email';
import { ESCAPE, NUMBER, TRIM, VALIDATE_DOMAIN_OBJECT } from '@angular-monorepo/data-adapter';

export const invitationRouter = Router();

registerRoute(
  createInvitationApi(),
  invitationRouter,
  async (payload, params, context) => {
    VALIDATE.requiredPayload(payload);
    payload.email = TRIM(ESCAPE(payload.email)) as string;
    await throwValidationError(async () => {
      const validationErrors = await VALIDATE_DOMAIN_OBJECT.validateCreateInvitation(
        payload.email,
      );
      return validationErrors;
    });

    return await new InvitationService(LOGGER).inviteToNamespace(
      payload.email,
      NUMBER(params.namespaceId),
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
    payload.name = TRIM(ESCAPE(payload.name)) as string;
    await throwValidationError(async () => {
      return VALIDATE_DOMAIN_OBJECT.validateAcceptInvitation(
        (
          invitationKey: string,
          ownerId: number,
          name: string,
        ) => {
          return new InvitationService(LOGGER).acceptInvitationValidation(
            invitationKey,
            ownerId,
            name,
          );
        },
        params.invitationKey,
        context.owner.id,
        payload.name,
      );
    });

    return await new InvitationService(LOGGER).acceptInvitation(
      params.invitationKey,
      context.owner.id,
      payload.name,
    );
  },
  AUTH_MIDDLEWARE.auth,
);

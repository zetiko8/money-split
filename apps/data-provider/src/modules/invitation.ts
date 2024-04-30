import { Invitation, InvitationViewData, MNamespace, Owner } from '@angular-monorepo/entities';
import { errorFirstProcedure, jsonProcedure, selectOneWhereSql } from '../connection/helper';
import { EntityPropertyType, InvitationEntity, MNamespaceEntity } from '../types';
import { randomUUID } from 'crypto';
import { sendMail } from './email';
import { appError, appErrorWrap } from '../helpers';

async function getInvitationByKey (
  invitationKey: string,
) {
  return await selectOneWhereSql<Invitation>(
    'Invitation',
    'invitationKey',
    EntityPropertyType.NON_EMPTY_STRING,
    invitationKey,
    InvitationEntity,
  );
}

async function getInvitationViewData (
  invitationKey: string,
): Promise<InvitationViewData> {
  return await appErrorWrap('getInvitationViewData', async () => {
    return await jsonProcedure<InvitationViewData>(
      `
      call getInvitationView(
        '${invitationKey}'
      );
      `,
    );
  });
}

async function acceptInvitation (
  invitationKey: string,
  owner: Owner,
  name: string,
): Promise<Invitation> {
  return await appErrorWrap('acceptInvitation', async () => {
    return await jsonProcedure<Invitation>(
      `
      call acceptInvitation(
        '${invitationKey}',
        ${owner.id},
        '${name}'
      );
      `,
    );
  });
}

export async function inviteToNamespace (
  email: string,
  namespaceId: number,
  ownerId: number,
): Promise<Invitation> {
  try {
    const invitation = await errorFirstProcedure<Invitation>(
      `
      call createInvitation(
        '${email}',
        ${ownerId},
        '${randomUUID()}',
        '${namespaceId}'
      );
      `,
    );

    invitation.accepted = !!(invitation.accepted);
    invitation.rejected = !!(invitation.rejected);

    await sendMail({
      subject: 'Invitation to Money Split Group',
      text: `
        <h1>
          Your friend has invited you to join a group.
        </h1>
        <p>
          Follow the link bellow to join.
        </p>
        <a href="http://localhost:4200/invitation/${invitation.invitationKey}/join">Link</a>
      `,
      to: email,
    });

    return invitation;
  } catch (error) {
    throw appError(
      error.message,
      'INVITATION_SERVICE.inviteToNamespace',
      error,
    );
  }
}

export const INVITATION_SERVICE = {
  acceptInvitation,
  getInvitationViewData,
  getInvitationByKey,
  inviteToNamespace,
};
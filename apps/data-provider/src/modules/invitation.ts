import { Invitation, InvitationViewData, MNamespace, Owner } from '@angular-monorepo/entities';
import { query } from '../connection/connection';
import { errorFirstProcedure, selectOneWhereSql } from '../connection/helper';
import { EntityPropertyType, InvitationEntity, MNamespaceEntity } from '../types';
import { addOwnerToNamespace } from './namespace';
import { createUser } from './user';
import { randomUUID } from 'crypto';
import { sendMail } from './email';
import { appError } from '../helpers';

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
  const invitation = await getInvitationByKey(invitationKey);

  const mNamespace = await selectOneWhereSql<MNamespace>(
    'Namespace',
    'id',
    EntityPropertyType.ID,
    invitation.namespaceId,
    MNamespaceEntity,
  );

  return Object.assign(invitation, { namespace: mNamespace });
}

async function acceptInvitation (
  invitationKey: string,
  owner: Owner,
  name: string,
): Promise<Invitation> {

  const updateSql = `
        UPDATE \`Invitation\`
        SET accepted = 1
        WHERE invitationKey = "${invitationKey}"
    `;
  await query(updateSql);

  const invitation = await getInvitationByKey(invitationKey);
  await addOwnerToNamespace(owner.id, invitation.namespaceId);

  await createUser(
    name, invitation.namespaceId, owner.id,
  );

  return invitation;
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
import { ERROR_CODE, Invitation, InvitationViewData, MNamespace, Owner } from "@angular-monorepo/entities";
import { lastInsertId, query } from "../connection/connection";
import { insertSql, selectOneWhereSql } from "../connection/helper";
import { EntityPropertyType, InvitationEntity, MNamespaceEntity } from "../types";
import { addOwnerToNamespace } from "./namespace";
import { createUser } from "./user";
import { randomUUID } from "crypto";
import { sendMail } from "./email";

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
  
    console.log(invitation);
  
    const mNamespace = await selectOneWhereSql<MNamespace>(
      'Namespace',
      'id',
      EntityPropertyType.ID,
      invitation.namespaceId,
      MNamespaceEntity,
    )
  
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
        name, invitation.namespaceId, owner.id
    );

    return invitation;
}

export async function inviteToNamespace (
  email: string,
  namespaceId: number,
  ownerId: number,
): Promise<Invitation> {

  const sameEmail = await query<Invitation[]>(`
  SELECT * FROM \`Invitation\`
  WHERE \`email\` = "${email}"
  AND \`namespaceId\` = ${namespaceId}`);

  if (sameEmail.length)
    throw Error(ERROR_CODE.RESOURCE_ALREADY_EXISTS);

  await query(insertSql(
    'Invitation',
    InvitationEntity,
    {
      email,
      namespaceId,
      created: new Date(),
      edited: new Date(),
      createdBy: ownerId,
      editedBy: ownerId,
      invitationKey: randomUUID(),
      accepted: false,
      rejected: false,
    }
  ));

  const id = await lastInsertId();

  const invitations = await query<Invitation[]>(`
    SELECT * FROM \`Invitation\`
    WHERE \`id\` = ${id}`);

  const invitation = invitations[0];

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
  })

  return invitation;
}

export const INVITATION_SERVICE = {
  acceptInvitation,
  getInvitationViewData,
  getInvitationByKey,
  inviteToNamespace,
}
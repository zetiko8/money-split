import { Invitation, InvitationViewData, MNamespace, Owner } from "@angular-monorepo/entities";
import { query } from "../connection/connection";
import { selectOneWhereSql } from "../connection/helper";
import { EntityPropertyType, InvitationEntity, MNamespaceEntity } from "../types";
import { addOwnerToNamespace } from "./namespace";
import { createUser } from "./user";

export async function getInvitationByKey (
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

export async function getInvitationViewData (
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

export async function acceptInvitation (
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

export const INVITATION_SERVICE = {
  deleteInvitationByEmail: async (
    email: string
  ) => {
    await query(
      `DELETE FROM \`Invitation\`
      WHERE email = "${email}"
      `
    )
  }
}
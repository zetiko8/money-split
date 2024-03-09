import { ERROR_CODE, Invitation, Owner } from "@angular-monorepo/entities"
import { query } from "../../connection/connection"
import { selectOneWhereSql } from "../../connection/helper"
import { EntityPropertyType, InvitationEntity } from "../../types"

export const CYBACKDOOR_SERVICE = {
    deleteOwner: async (
        username: string
    ) => {
        await query(
            `DELETE FROM Owner WHERE username = "${username}"`
        )
    },
    deleteNamespaceByName: async (
        namespaceName: string
    ) => {
        await query(
            `DELETE FROM \`Namespace\`
            WHERE name = "${namespaceName}"
            `
        )
    },
    deleteInvitationByEmail: async (
        email: string
      ) => {
        await query(
          `DELETE FROM \`Invitation\`
          WHERE email = "${email}"
          `
        )
    },
    getOwnerByUsername: async (
        username: string
      ) => {
        const owner = await query<Owner[]>(`
        SELECT * FROM \`Owner\`
        WHERE \`username\` = "${username}"`);
      
        if (!owner.length)
          throw Error(ERROR_CODE.RESOURCE_NOT_FOUND);
      
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (owner[0] as any).hash;
      
        return owner[0];
    },
    getInvitationByEmail: async (
        email: string
      ) => {
        return await selectOneWhereSql<Invitation>(
          'Invitation',
          'email',
          EntityPropertyType.STRING,
          email,
          InvitationEntity,
        )
    },
}
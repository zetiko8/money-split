import { ERROR_CODE, Invitation, MNamespace, NamespaceView, Owner, User } from "@angular-monorepo/entities";
import { query } from "../connection/connection";
import { insertSql, lastInsertId, selectWhereSql } from "../connection/helper";
import { EntityPropertyType, InvitationEntity, MNamespaceEntity, NamespaceOwnerEntity } from "../types";
import { USER_SERVICE } from "./user";

export async function addOwnerToNamespace (
    ownerId: number,
    namespaceId: number,
) {
    await query(insertSql(
        'NamespaceOwner',
        NamespaceOwnerEntity,
        { ownerId, namespaceId }
      ));
}

async function createNamespace (
    name: string,
    owner: Owner,
  ): Promise<MNamespace> {
  
    const namespaces = await query<MNamespace[]>
    (`
    SELECT * FROM NamespaceOwner no2 
    INNER JOIN Namespace n 
    ON n.id = no2.namespaceId
    WHERE no2.ownerId = ${owner.id}
    AND n.name = "${name}"
    `);
  
    if (namespaces.length)
      throw Error(ERROR_CODE.RESOURCE_ALREADY_EXISTS);
  
    await query(insertSql(
      'Namespace',
      MNamespaceEntity,
      { name }
    ));
  
    const namespaceId = await lastInsertId();
  
    await addOwnerToNamespace(owner.id, namespaceId);
    await USER_SERVICE.createUser(
        owner.username,
        namespaceId,
        owner.id,
    )
  
    return {
      id: namespaceId,
      name,
    };
  }

async function getNamespaceViewForOwner (
    namespaceId: number,
    ownerId: number,
): Promise<NamespaceView> {

const namespaces = await query<MNamespace[]>
    (
    `
    SELECT * FROM NamespaceOwner no2 
    INNER JOIN Namespace n 
    ON n.id = no2.namespaceId
    WHERE no2.ownerId = ${ownerId}
    AND n.id = ${namespaceId}
    `
    );

if (!namespaces.length)
    throw Error(ERROR_CODE.RESOURCE_NOT_FOUND);

const invitations = (await selectWhereSql<Invitation[]>(
    'Invitation', 
    'namespaceId', 
    EntityPropertyType.ID,
    namespaceId,
    InvitationEntity,
)).filter(invitation => !invitation.accepted);

const users = await query<User[]>
(
    `
    SELECT * FROM \`User\` 
    WHERE namespaceId = ${namespaceId}
    `
);

const ownerUsers = await USER_SERVICE
    .getNamespaceOwnerUsers(ownerId, namespaceId);

const namespaceView: NamespaceView = {
    id: namespaces[0].id,
    name: namespaces[0].name,
    invitations,
    users,
    ownerUsers,
};

return namespaceView;
}

export const NAMESPACE_SERVICE = {
    deleteNamespace: async (
        namespaceId: number
    ) => {
        await query(
            `DELETE FROM \`Namespace\`
            WHERE id = ${namespaceId}
            `
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
    createNamespace,
    addOwnerToNamespace,
    getNamespaceViewForOwner,
}
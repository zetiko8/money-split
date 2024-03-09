import { ERROR_CODE, Invitation, MNamespace, NamespaceView, Owner, Record, RecordDataView, RecordView, User } from "@angular-monorepo/entities";
import { query } from "../connection/connection";
import { insertSql, lastInsertId, selectOneWhereSql, selectWhereSql } from "../connection/helper";
import { EntityPropertyType, InvitationEntity, MNamespaceEntity, NamespaceOwnerEntity } from "../types";
import { USER_SERVICE } from "./user";
import { RECORD_SERVICE } from "./record";
import { asyncMap } from "../helpers";

export async function getNamespacesForOwner (
    ownerId: number,
  ): Promise<MNamespace[]> {
  
    const namespaces = await query<MNamespace[]>
      (`
      SELECT * FROM NamespaceOwner no2 
      INNER JOIN Namespace n 
      ON n.id = no2.namespaceId
      WHERE no2.ownerId = ${ownerId}
      `);
  
    return namespaces;
}

async function getNamespaceById (
    id: number
): Promise<MNamespace> {
    return await selectOneWhereSql<MNamespace>(
        'Namespace',
        'id',
        EntityPropertyType.ID,
        id,
        MNamespaceEntity,
    );
}

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

const namespace = await getNamespaceById(namespaceId);
const records 
    = await RECORD_SERVICE.getNamespaceRecords(namespaceId);

const recordViews: RecordView[]
    = await asyncMap<Record, RecordView>(records, async (record) => {
        const createdBy = await USER_SERVICE.getUserById(record.createdBy);
        const editedBy = await USER_SERVICE.getUserById(record.editedBy);
        const benefitors = await asyncMap(
            record.data.benefitors,
            async benefitorId => await USER_SERVICE.getUserById(benefitorId),
        );
        const paidBy = await asyncMap(
            record.data.paidBy,
            async paidById => await USER_SERVICE.getUserById(paidById),
        );
        const data: RecordDataView = {
            cost: record.data.cost,
            currency: record.data.currency,
            benefitors,
            paidBy, 
        }
        const recordView: RecordView = {
            created: record.created,
            edited: record.edited,
            id: record.id,
            createdBy,
            editedBy,
            namespace,
            data,
        }

        return recordView;
    })

const namespaceView: NamespaceView = {
    id: namespaces[0].id,
    name: namespaces[0].name,
    invitations,
    users,
    ownerUsers,
    records: recordViews,
};

return namespaceView;
}

async function mapToRecordView (
    record: Record,
    namespace: MNamespace,
): Promise<RecordView> {
    const createdBy = await USER_SERVICE.getUserById(record.createdBy);
    const editedBy = await USER_SERVICE.getUserById(record.editedBy);
    const benefitors = await asyncMap(
        record.data.benefitors,
        async benefitorId => await USER_SERVICE.getUserById(benefitorId),
    );
    const paidBy = await asyncMap(
        record.data.paidBy,
        async paidById => await USER_SERVICE.getUserById(paidById),
    );
    const data: RecordDataView = {
        cost: record.data.cost,
        currency: record.data.currency,
        benefitors,
        paidBy, 
    }
    const recordView: RecordView = {
        created: record.created,
        edited: record.edited,
        id: record.id,
        createdBy,
        editedBy,
        namespace,
        data,
    }

    return recordView;
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
    createNamespace,
    addOwnerToNamespace,
    getNamespaceViewForOwner,
    getNamespaceById,
    getNamespacesForOwner,
    mapToRecordView,
}
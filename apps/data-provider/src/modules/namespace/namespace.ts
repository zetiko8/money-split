import {
  CreateNamespacePayload,
  ERROR_CODE,
  Invitation,
  MNamespace,
  MNamespaceSettings,
  NamespaceView,
  Owner,
  Record,
  RecordData,
  RecordDataView,
  RecordView,
  Settlement,
  SettlementListView,
  User,
} from '@angular-monorepo/entities';
import { query } from '../../connection/connection';
import { jsonProcedure, selectOneWhereSql, selectWhereSql } from '../../connection/helper';
import { EntityPropertyType, InvitationEntity, MNamespaceEntity, SettlementEntity } from '../../types';
import { USER_SERVICE } from '../user/user';
import { RECORD_SERVICE } from '../record/record';
import { appError, appErrorWrap } from '../../helpers';
import { SETTLE_SERVICE } from '../settle/settle';
import { asyncMap } from '@angular-monorepo/utils';

export async function getNamespacesForOwner (
  ownerId: number,
): Promise<MNamespace[]> {
  return await appErrorWrap('getNamespacesForOwner', async () => {
    return await jsonProcedure<MNamespace[]>(
      `
      call getOwnerNamespaces(
        '${ownerId}'
      );
      `,
    );
  });
}

async function getNamespaceById (
  id: number,
): Promise<MNamespace> {
  return await selectOneWhereSql<MNamespace>(
    'Namespace',
    'id',
    EntityPropertyType.ID,
    id,
    MNamespaceEntity,
  );
}

async function createNamespace (
  payload: CreateNamespacePayload,
  owner: Owner,
): Promise<MNamespace> {

  const result = await query<unknown[]>(
    `
    call createNamespace1(
      '${payload.namespaceName}',
      ${owner.id},
      '${payload.avatarColor}',
      ${payload.avatarUrl ? `'${payload.avatarUrl}'` : 'NULL'},
      '${owner.username}',
      '${owner.avatarId}'
    );
    `,
  );

  if (result[result.length - 2][0].ERROR !== null) {
    throw appError(
      result[result.length - 2][0].ERROR,
      'NAMESPACE_SERVICE.createNamespace',
      Error('procedure expected error'),
    );
  } else {
    return result[0][0] as MNamespace;
  }
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
        `,
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
        `,
  );

  const ownerUsers = await USER_SERVICE
    .getNamespaceOwnerUsers(ownerId, namespaceId);

  const namespace = await getNamespaceById(namespaceId);
  const records
        = await RECORD_SERVICE.getNamespaceRecords(namespaceId);

  const recordViews: RecordView[]
        = await asyncMap<Record, RecordView>(
          records, async (record) => await mapToRecordView(
            record, namespace));

  const hasRecordsToSettle = (() => {
    if (!records.length) return false;
    if (records.some(record => record.settlementId === null))
      return true;
    return false;
  })();

  const settlements
        = await NAMESPACE_SERVICE.getSettlementListViews(namespaceId);

  const namespaceView: NamespaceView = {
    id: namespaces[0].id,
    name: namespaces[0].name,
    invitations,
    users,
    ownerUsers,
    records: recordViews,
    avatarId: namespace.avatarId,
    hasRecordsToSettle,
    settlements,
  };

  return namespaceView;
}

async function mapToRecordView (
  record: Record,
  namespace: MNamespace,
): Promise<RecordView> {
  const createdBy = await USER_SERVICE.getUserById(record.createdBy);
  const editedBy = await USER_SERVICE.getUserById(record.editedBy);
  const data = await mapToRecordDataView(record.data);
  const settlement = await SETTLE_SERVICE
    .getSettlementMaybeById(record.settlementId);
  const recordView: RecordView = {
    created: record.created,
    edited: record.edited,
    id: record.id,
    createdBy,
    editedBy,
    namespace,
    data,
    settlementId: record.settlementId,
    settledOn: settlement?.created || null,
  };

  return recordView;
}

async function mapToRecordDataView (
  record: RecordData,
): Promise<RecordDataView> {
  const benefitors = await asyncMap(
    record.benefitors,
    async benefitorId => await USER_SERVICE.getUserById(benefitorId),
  );
  const paidBy = await asyncMap(
    record.paidBy,
    async paidById => await USER_SERVICE.getUserById(paidById),
  );
  const data: RecordDataView = {
    cost: record.cost,
    currency: record.currency,
    benefitors,
    paidBy,
  };

  return data;
}

async function getSettlementListViews (
  namespaceId: number,
): Promise<SettlementListView[]> {
  const settlements = await selectWhereSql<Settlement[]>(
    'Settlement',
    'namespaceId',
    EntityPropertyType.ID,
    namespaceId,
    SettlementEntity,
  );

  settlements.sort((a, b) => a.created < b.created ? 1 : -1);

  const settlementListViews = await asyncMap<
        Settlement, SettlementListView>(
          settlements,
          async settlement => {

            const settleRecords = await SETTLE_SERVICE
              .getSettlementRecordViews(settlement.id);

            const isAllSettled = settleRecords
              .every(record => record.settled);

            return {
              settlement,
              settledBy: await USER_SERVICE
                .getUserById(settlement.createdBy),
              settleRecords,
              isAllSettled,
            };
          },
        );

  return settlementListViews;
}

export async function getNamespaceSettings (
  namespaceId: number,
): Promise<MNamespaceSettings> {
  return await appErrorWrap('getNamespaceSettings', async () => {
    return await jsonProcedure<MNamespaceSettings>(
      `
      call getNamespaceSettings(
        '${namespaceId}'
      );
      `,
    );
  });
}

export async function editNamespaceSettings (
  namespaceId: number,
  payload: CreateNamespacePayload,
): Promise<MNamespaceSettings> {
  return await appErrorWrap('editNamespaceSettings', async () => {
    return await jsonProcedure<MNamespaceSettings>(
      `
      call editNamespaceSettings(
        ${namespaceId},
        '${payload.namespaceName}',
        '${payload.avatarColor}',
        ${payload.avatarUrl ? `'${payload.avatarUrl}'` : 'NULL'}
      );
      `,
    );
  });
}

export const NAMESPACE_SERVICE = {
  deleteNamespace: async (
    namespaceId: number,
  ) => {
    await query(
      `DELETE FROM \`Namespace\`
            WHERE id = ${namespaceId}
            `,
    );
  },
  createNamespace,
  getNamespaceViewForOwner,
  getNamespaceById,
  getNamespacesForOwner,
  mapToRecordView,
  mapToRecordDataView,
  getSettlementListViews,
  getNamespaceSettings,
  editNamespaceSettings,
};
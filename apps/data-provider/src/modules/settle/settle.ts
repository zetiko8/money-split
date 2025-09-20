import { ERROR_CODE, paymentEventsToRecordsWithIds, RecordData, RecordDataView, Settlement, SettlementDebt, SettlementDebtView, SettlementPayload, SettlementPreview, SettlementRecord, SettlementSettings } from '@angular-monorepo/entities';
import { settle, deptToRecordData } from '@angular-monorepo/debt-simplification';
import { NAMESPACE_SERVICE } from '../namespace/namespace';
import { insertSql, mysqlDate, selectMaybeOneWhereSql, selectOneWhereSql, selectWhereSql } from '../../connection/helper';
import { lastInsertId, query } from '../../connection/connection';
import { EntityPropertyType, SettlementDebtEntity, SettlementEntity } from '../../types';
import { USER_SERVICE } from '../user/user';
import { asyncMap } from '@angular-monorepo/utils';
import { PAYMENT_EVENT_SERVICE } from '../payment-event/payment-event';

async function getSettleRecords (
  namespaceId: number,
  payload: SettlementPayload,
  ownerId: number,
): Promise<{
  recordsToSettle: {
    paymentEventId: number;
    record: RecordData;
  }[],
  settleRecords: RecordData[]
}> {
  const paymentEvents = await PAYMENT_EVENT_SERVICE
    .getNamespacePaymentEvents(namespaceId, ownerId);

  if (paymentEvents.find(record => record.settlementId !== null))
    throw Error(ERROR_CODE.USER_ACTION_CONFLICT);

  const recordsToSettle = paymentEventsToRecordsWithIds(
    paymentEvents.filter(pe => payload.paymentEvents.includes(pe.id)));

  const currency = recordsToSettle[0].record.currency;

  const settleRecords = settle(recordsToSettle.map(r => r.record))
    .map(debt => deptToRecordData(debt, currency));
  return {
    settleRecords,
    recordsToSettle,
  };
};

export const SETTLE_SERVICE = {
  createSettlement: async (
    byUser: number,
    namespaceId: number,
  ): Promise<Settlement> => {
    await query(insertSql(
      'Settlement',
      SettlementEntity,
      {
        created: new Date(),
        edited: new Date(),
        createdBy: byUser,
        editedBy: byUser,
        namespaceId,
      },
    ));

    const settlementId = await lastInsertId();

    return SETTLE_SERVICE.getSettlementById(settlementId);
  },
  createSettlementDebt: async (
    byUser: number,
    namespaceId: number,
    settlementId: number,
    data: RecordData,
    settled: boolean,
    settledOn: Date | null,
    settledBy: number | null,
  ): Promise<SettlementDebt> => {
    await query(insertSql(
      'SettlementDebt',
      SettlementDebtEntity,
      {
        created: new Date(),
        edited: new Date(),
        createdBy: byUser,
        editedBy: byUser,
        namespaceId,
        settlementId,
        settled,
        data,
        settledOn,
        settledBy,
      },
    ));

    const settlementDebtId = await lastInsertId();

    return SETTLE_SERVICE.getSettlementDebtById(settlementDebtId);
  },
  getSettlementById: async (
    settlementId: number,
  ) => {
    return await selectOneWhereSql<Settlement>(
      'Settlement',
      'id',
      EntityPropertyType.ID,
      settlementId,
      SettlementEntity,
    );
  },
  getSettlementMaybeById: async (
    settlementId: number,
  ): Promise<Settlement | null> => {
    return await selectMaybeOneWhereSql<Settlement>(
      'Settlement',
      'id',
      EntityPropertyType.ID,
      settlementId,
      SettlementEntity,
    );
  },
  getSettlementDebtById: async (
    settlementDebtId: number,
  ) => {
    return await selectOneWhereSql<SettlementDebt>(
      'SettlementDebt',
      'id',
      EntityPropertyType.ID,
      settlementDebtId,
      SettlementDebtEntity,
    );
  },
  settleNamespacePreview: async (
    namespaceId: number,
    payload: SettlementPayload,
    ownerId: number,
  ): Promise<SettlementPreview> => {

    const { settleRecords }
      = await getSettleRecords(namespaceId, payload, ownerId);

    const settleRecordsData = await asyncMap<
            RecordData, SettlementRecord>(
              settleRecords, async (record) => {
                return {
                  data: await NAMESPACE_SERVICE
                    .mapToRecordDataView(record),
                  settled: false,
                  settledBy: null,
                  settledOn: null,
                };
              });
    return {
      settleRecords: settleRecordsData,
      paymentEvents: await PAYMENT_EVENT_SERVICE
        .getNamespacePaymentEventsView(namespaceId, ownerId),
      namespace: await NAMESPACE_SERVICE
        .getNamespaceViewForOwner(namespaceId, ownerId),
    };
  },
  settle: async (
    byUser: number,
    namespaceId: number,
    payload: SettlementPayload,
    ownerId: number,
  ) => {

    const { settleRecords, recordsToSettle }
      = await getSettleRecords(namespaceId, payload, ownerId);

    const settlement = await SETTLE_SERVICE.createSettlement(
      byUser, namespaceId);

    await asyncMap(
      settleRecords,
      async (record) => await SETTLE_SERVICE.createSettlementDebt(
        byUser,
        namespaceId,
        settlement.id,
        record,
        false,
        null,
        null,
      ),
    );

    await asyncMap(
      recordsToSettle,
      async (record) => await PAYMENT_EVENT_SERVICE.addPaymentEventToSettlement(
        record.paymentEventId, settlement.id, byUser, ownerId, namespaceId),
    );

    return settlement;
  },
  getSettleSettings: async (
    namespaceId: number,
    ownerId: number,
  ): Promise<SettlementSettings> => {
    const paymentEvents = await PAYMENT_EVENT_SERVICE
      .getNamespacePaymentEventsView(namespaceId, ownerId);
    return {
      paymentEventsToSettle: paymentEvents.filter(pe => !pe.settlementId),
      namespace: await NAMESPACE_SERVICE
        .getNamespaceViewForOwner(namespaceId, ownerId),
    };
  },
  getSettlementRecordViews: async (
    settlementId: number,
  ): Promise<SettlementDebtView[]> => {
    const settlementDebts = await selectWhereSql<SettlementDebt[]>(
      'SettlementDebt',
      'settlementId',
      EntityPropertyType.ID,
      settlementId,
      SettlementDebtEntity,
    );

    const settlementDebtViews = await asyncMap<
            SettlementDebt, SettlementDebtView>(
              settlementDebts,
              async settlementDebt => {

                const data: RecordDataView
                        = await NAMESPACE_SERVICE.mapToRecordDataView(
                          settlementDebt.data,
                        );

                return {
                  created: settlementDebt.created,
                  edited: settlementDebt.edited,
                  createdBy: await USER_SERVICE
                    .getUserById(settlementDebt.createdBy),
                  editedBy: await USER_SERVICE
                    .getUserById(settlementDebt.editedBy),
                  id: settlementDebt.id,
                  settled: settlementDebt.settled,
                  settlementId: settlementDebt.settlementId,
                  data,
                  settledOn: settlementDebt.settledOn,
                  settledBy: settlementDebt.settledBy ?
                    await USER_SERVICE.getUserById(settlementDebt.settledBy)
                    : null,
                };
              },
            );

    return settlementDebtViews;
  },
  setDebtIsSettled: async (
    byUser: number,
    debtId: number,
    isSettled: boolean,
  ) => {
    const updateSql = `
            UPDATE \`SettlementDebt\`
            SET settled = ${isSettled ? 1 : 0},
            settledOn = ${isSettled ? ('\'' + mysqlDate(new Date()) + '\'') : 'NULL'},
            settledBy = ${isSettled ? byUser : 'NULL'},
            edited = '${mysqlDate(new Date())}',
            editedBy = ${byUser}
            WHERE id = ${debtId}
        `;
    await query(updateSql);
  },
};
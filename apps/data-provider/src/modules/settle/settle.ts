import { ERROR_CODE, paymentEventsToRecordsWithIds, RecordData, RecordDataView, Settlement, SettlementDebt, SettlementDebtView, SettlementPayload, SettlementPreview, SettlementRecord, SettlementSettings } from '@angular-monorepo/entities';
import { settle, deptToRecordData } from '@angular-monorepo/debt-simplification';
import { insertSql, mysqlDate, selectMaybeOneWhereSql, selectOneWhereSql, selectWhereSql } from '../../connection/helper';
import { lastInsertId, query } from '../../connection/connection';
import { EntityPropertyType, SettlementDebtEntity, SettlementEntity } from '../../types';
import { UserHelpersService, getTransactionContext, NamespaceHelpersService, PaymentEventHelpersService } from '@angular-monorepo/mysql-adapter';
import { LOGGER } from '../../helpers';
import { asyncMap } from '@angular-monorepo/utils';

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
  const paymentEvents = await getTransactionContext(
    { logger: LOGGER }, (transaction) => {
      return PaymentEventHelpersService
        .getNamespacePaymentEvents(transaction, namespaceId, ownerId);
    },
  );

  const paymentEventsToSettle
    = paymentEvents.filter(pe => payload.paymentEvents.includes(pe.id));

  if (paymentEventsToSettle.find(record => record.settlementId !== null))
    throw Error(ERROR_CODE.USER_ACTION_CONFLICT);

  const recordsToSettle = paymentEventsToRecordsWithIds(
    paymentEventsToSettle);

  const recordsToSettleByCurrency: Record<string, RecordData[]> = {};
  recordsToSettle.forEach(record => {
    if (!recordsToSettleByCurrency[record.record.currency])
      recordsToSettleByCurrency[record.record.currency] = [];
    recordsToSettleByCurrency[record.record.currency].push(record.record);
  });

  const settleRecords: RecordData[] = [];

  if (payload.separatedSettlementPerCurrency) {
    Object.entries(recordsToSettleByCurrency).forEach(([currency, records]) => {
      settleRecords.push(...settle(records).map(debt => deptToRecordData(debt, currency)));
    });
  } else {
    const currenyConvertedRecords: RecordData[] = [];

    Object.entries(recordsToSettleByCurrency)
      .forEach(([currency, records]) => {
        currenyConvertedRecords.push(...records.map(r => {
          return {
            benefitors: r.benefitors,
            cost: r.cost * (payload.currencies[currency]),
            paidBy: r.paidBy,
            currency: payload.mainCurrency,
          };
        }));
      });

    settleRecords.push(...settle(currenyConvertedRecords).map(debt => deptToRecordData(debt, payload.mainCurrency)));
  }

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
    return await getTransactionContext({ logger: LOGGER}, async (transaction) => {
      const { settleRecords }
      = await getSettleRecords(namespaceId, payload, ownerId);

      const settleRecordsData = await asyncMap<
            RecordData, SettlementRecord>(
              settleRecords, async (record) => {
                return {
                  data: await NamespaceHelpersService
                    .mapToRecordDataView(transaction, record),
                  settled: false,
                  settledBy: null,
                  settledOn: null,
                };
              });
      return {
        settleRecords: settleRecordsData,
        paymentEvents: await PaymentEventHelpersService
          .getNamespacePaymentEventsView(transaction, namespaceId, ownerId),
        namespace: await NamespaceHelpersService
          .getNamespaceViewForOwner(transaction, namespaceId, ownerId),
      };
    });
  },
  settle: async (
    byUser: number,
    namespaceId: number,
    payload: SettlementPayload,
    ownerId: number,
  ) => {
    return getTransactionContext(
      { logger: LOGGER}, async (transaction) => {
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
          async (record) => await PaymentEventHelpersService.addPaymentEventToSettlement(
            transaction,
            record.paymentEventId,
            settlement.id,
            byUser,
            ownerId,
            namespaceId,
          ),
        );

        return settlement;
      });

  },
  getSettleSettings: async (
    namespaceId: number,
    ownerId: number,
  ): Promise<SettlementSettings> => {
    return await getTransactionContext({ logger: LOGGER}, async (transaction) => {
      const paymentEvents = await PaymentEventHelpersService
        .getNamespacePaymentEventsView(transaction, namespaceId, ownerId);
      return {
        paymentEventsToSettle: paymentEvents.filter(pe => !pe.settlementId),
        namespace: await NamespaceHelpersService
          .getNamespaceViewForOwner(transaction, namespaceId, ownerId),
      };
    });
  },
  getSettlementRecordViews: async (
    settlementId: number,
  ): Promise<SettlementDebtView[]> => {
    return await getTransactionContext({ logger: LOGGER}, async (transaction) => {

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
                          = await NamespaceHelpersService.mapToRecordDataView(
                            transaction,
                            settlementDebt.data,
                          );

                  const createdBy = await UserHelpersService.getUserById(
                    transaction,
                    settlementDebt.createdBy,
                  );
                  const editedBy = await UserHelpersService.getUserById(
                    transaction,
                    settlementDebt.editedBy,
                  );
                  const settledBy = settlementDebt.settledBy
                    ? await UserHelpersService.getUserById(transaction, settlementDebt.settledBy)
                    : null;

                  return {
                    created: settlementDebt.created,
                    edited: settlementDebt.edited,
                    createdBy,
                    editedBy,
                    id: settlementDebt.id,
                    settled: settlementDebt.settled,
                    settlementId: settlementDebt.settlementId,
                    data,
                    settledOn: settlementDebt.settledOn,
                    settledBy,
                  };
                },
              );

      return settlementDebtViews;

    });
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
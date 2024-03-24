import { ERROR_CODE, RecordData, Settlement, SettlementDebt, SettlementPreview } from "@angular-monorepo/entities";
import { RECORD_SERVICE } from "./record";
import { settle, deptToRecordData } from "@angular-monorepo/debt-simplification";
import { asyncMap } from "../helpers";
import { NAMESPACE_SERVICE } from "./namespace";
import { insertSql, selectOneWhereSql } from "../connection/helper";
import { lastInsertId, query } from "../connection/connection";
import { EntityPropertyType, SettlementDebtEntity, SettlementEntity } from "../types";

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
            }
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
            }
        ));

        const settlementDebtId = await lastInsertId();

        return SETTLE_SERVICE.getSettlementDebtById(settlementDebtId);
    },
    getSettlementById: async (
        settlementId: number
    ) => {
        return await selectOneWhereSql<Settlement>(
            'Settlement',
            'id',
            EntityPropertyType.ID,
            settlementId,
            SettlementEntity,
        );
    },
    getSettlementDebtById: async (
        settlementDebtId: number
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
        ownerId: number,
    ): Promise<SettlementPreview> => {
        const records = (await RECORD_SERVICE
            .getNamespaceRecords(namespaceId))
            .filter(record => record.settlementId === null);

        const namespace 
            = await NAMESPACE_SERVICE.getNamespaceById(namespaceId);
        const recordsView = await asyncMap(
            records, async (record) => await NAMESPACE_SERVICE
                .mapToRecordView(record, namespace));
        
        const currency = records[0].data.currency;

        const settleRecords = settle(records.map(record => record.data))
            .map(debt => deptToRecordData(debt, currency));

        const settleRecordsData = await asyncMap(
            settleRecords, async (record) => await NAMESPACE_SERVICE
                .mapToRecordDataView(record));
        return {
            settleRecords: settleRecordsData,
            records: recordsView,
            namespace: await NAMESPACE_SERVICE
                .getNamespaceViewForOwner(namespaceId, ownerId)
        };
    },
    settle: async (
        byUser: number,
        namespaceId: number,
        records: number[],
    ) => {

        if (!records.length)
            throw Error(ERROR_CODE.INVALID_REQUEST);

        const recordsToSettle 
            = await RECORD_SERVICE.getRecordsById(records);

        if (recordsToSettle.find(record => record.settlementId !== null))
            throw Error(ERROR_CODE.USER_ACTION_CONFLICT);

        const currency = recordsToSettle[0].data.currency;

        const settleRecords = settle(recordsToSettle
            .map(record => record.data))
            .map(debt => deptToRecordData(debt, currency));

        const settlement = await SETTLE_SERVICE.createSettlement(
            byUser, namespaceId);

        await asyncMap(
            settleRecords,
            async (record) => await SETTLE_SERVICE.createSettlementDebt(
                byUser, namespaceId, settlement.id, record, false,
            ),
        );

        await RECORD_SERVICE.addRecordsToSettlement(
            recordsToSettle.map(r => r.id), settlement.id, byUser);

        return settlement;
    }
};
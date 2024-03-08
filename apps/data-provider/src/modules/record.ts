import { Record, RecordData } from "@angular-monorepo/entities"
import { insertSql, mysqlDate, selectOneWhereSql, selectWhereSql } from "../connection/helper"
import { EntityPropertyType, RecordEntity } from "../types"
import { lastInsertId, query } from "../connection/connection";

export const RECORD_SERVICE = {
    addRecord: async (
        namespaceId: number,
        userId: number,
        data: RecordData,
    ) => {
        await query(insertSql(
            'Record',
            RecordEntity,
            {
                created: new Date(),
                edited: new Date(),
                createdBy: userId,
                editedBy: userId,
                data,
                namespaceId,
            }
        ));

        const recordId = await lastInsertId();

        return RECORD_SERVICE.getRecordById(recordId);
    },
    editRecord: async (
        userId: number,
        recordId: number,
        data: RecordData,
    ) => {

        await RECORD_SERVICE.getRecordById(recordId);

        const updateSql = `
            UPDATE \`Record\`
            SET
            data = '${JSON.stringify(data)}',
            edited = '${mysqlDate(new Date())}',
            editedBy = ${userId}
            WHERE id = ${recordId}
        `;
        await query(updateSql);

        return RECORD_SERVICE.getRecordById(recordId);
    },
    getRecordById: async (
        recordId: number
    ) => {
        return await selectOneWhereSql<Record>(
            'Record',
            'id',
            EntityPropertyType.ID,
            recordId,
            RecordEntity,
        );
    },
    getNamespaceRecords: async (
        namespaceId: number,
    ) => {
        return await selectWhereSql<Record[]>(
            'Record',
            'namespaceId',
            EntityPropertyType.ID,
            namespaceId,
            RecordEntity,
        );
    }
}
import { RecordData } from "@angular-monorepo/entities"
import { insertSql, selectOneWhereSql } from "../connection/helper"
import { EntityPropertyType, RecordEntity } from "../types"
import { lastInsertId, query } from "../connection/connection";

export const RECORD_SERVICE = {
    addRecord: async (
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
            }
        ));

        const recordId = await lastInsertId();

        return RECORD_SERVICE.getRecordById(recordId);
    },
    getRecordById: async (
        recordId: number
    ) => {
        return await selectOneWhereSql<RecordData>(
            'Record',
            'id',
            EntityPropertyType.ID,
            recordId,
            RecordEntity,
        );
    },
}
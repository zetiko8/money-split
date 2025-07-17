import { Record, RecordData, RecordDataBackdoor } from '@angular-monorepo/entities';
import { jsonProcedure, mysqlDate, selectOneWhereSql, selectWhereSql } from '../../connection/helper';
import { EntityPropertyType, RecordEntity } from '../../types';
import { query } from '../../connection/connection';
import { appErrorWrap } from '../../helpers';
import { asyncMap } from '@angular-monorepo/utils';

export const RECORD_SERVICE = {
  addRecord: async (
    namespaceId: number,
    userId: number,
    data: RecordData,
    ownerId: number,
  ): Promise<Record> => {
    return await appErrorWrap('addRecord', async () => {
      const res = await jsonProcedure<Record>(
        `
        call addRecord(
          '${namespaceId}',
          ${ownerId},
          ${userId},
          '${JSON.stringify(data)}'
        );
        `,
      );

      res.data = JSON.parse(res.data as unknown as string);

      return res;
    });
  },
  addRecordBackdoor: async (
    namespaceId: number,
    data: RecordDataBackdoor,
  ): Promise<Record> => {
    return await appErrorWrap('addRecordBackdoor', async () => {
      const res = await jsonProcedure<Record>(
        `
        call addRecordBackdoor(
          '${namespaceId}',
          ${data.addingOwnerId},
          ${data.addingUserId},
          '${mysqlDate(new Date(data.created))}',
          '${mysqlDate(new Date(data.edited))}',
          '${JSON.stringify(data)}'
        );
        `,
      );

      res.data = JSON.parse(res.data as unknown as string);
      return res;
    });
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
  addRecordToSettlement: async (
    recordId: number,
    settlementId: number,
    addedBy: number,
  ) => {

    await RECORD_SERVICE.getRecordById(recordId);

    const updateSql = `
            UPDATE \`Record\`
            SET
            settlementId = ${settlementId},
            edited = '${mysqlDate(new Date())}',
            editedBy = ${addedBy}
            WHERE id = ${recordId}
        `;
    await query(updateSql);

    return RECORD_SERVICE.getRecordById(recordId);
  },
  addRecordsToSettlement: async (
    records: number[],
    settlementId: number,
    addedBy: number,
  ) => {
    return await asyncMap(
      records,
      async (recordId) => await RECORD_SERVICE
        .addRecordToSettlement(recordId, settlementId, addedBy),
    );
  },
  getRecordById: async (
    recordId: number,
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
    const records = await selectWhereSql<Record[]>(
      'Record',
      'namespaceId',
      EntityPropertyType.ID,
      namespaceId,
      RecordEntity,
    );

    records.sort((a, b) => a.created < b.created ? 1 : -1);
    return records;
  },
  getRecordsById: async (
    records: number[],
  ): Promise<Record[]> => {
    const result = await asyncMap(
      records,
      async (recordId) => await RECORD_SERVICE
        .getRecordById(recordId),
    );

    return result;
  },
};
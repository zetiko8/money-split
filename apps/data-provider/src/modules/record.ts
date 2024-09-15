import { Record, RecordData } from '@angular-monorepo/entities';
import { insertSql, mysqlDate, selectOneWhereSql, selectWhereSql } from '../connection/helper';
import { EntityPropertyType, RecordEntity } from '../types';
import { lastInsertId, query } from '../connection/connection';
import { asyncMap } from '../helpers';

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
        settlementId: null,
      },
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
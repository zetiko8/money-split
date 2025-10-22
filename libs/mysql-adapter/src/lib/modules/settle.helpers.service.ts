import { Settlement, SettlementDebt, SettlementDebtView, RecordDataView, RecordData } from '@angular-monorepo/entities';
import { Transaction } from '../mysql-adapter';
import { asyncMap } from '@angular-monorepo/utils';
import { UserHelpersService } from './user.helpers.service';
import { NamespaceHelpersService } from './namespace.helpers.service';

export class SettleHelpersService {
  static async getSettlementById(
    transaction: Transaction,
    settlementId: number,
  ): Promise<Settlement> {
    const sql = 'SELECT * FROM `Settlement` WHERE id = ?';
    const result = await transaction.query<Settlement[]>(sql, [settlementId]);
    if (!result || result.length === 0) {
      throw new Error('Settlement not found');
    }
    return result[0];
  }

  static async getSettlementMaybeById(
    transaction: Transaction,
    settlementId: number,
  ): Promise<Settlement | null> {
    try {
      return await SettleHelpersService.getSettlementById(transaction, settlementId);
    } catch {
      return null;
    }
  }

  static async getSettlementDebtById(
    transaction: Transaction,
    settlementDebtId: number,
  ): Promise<SettlementDebt> {
    const sql = 'SELECT * FROM `SettlementDebt` WHERE id = ?';
    const result = await transaction.query<SettlementDebt[]>(sql, [settlementDebtId]);
    if (!result || result.length === 0) {
      throw new Error('SettlementDebt not found');
    }
    return result[0];
  }

  static async createSettlement(
    transaction: Transaction,
    byUser: number,
    namespaceId: number,
  ): Promise<Settlement> {
    const now = new Date();
    const insertSql = `
      INSERT INTO \`Settlement\` (created, edited, createdBy, editedBy, namespaceId)
      VALUES (?, ?, ?, ?, ?)
    `;
    await transaction.query(insertSql, [now, now, byUser, byUser, namespaceId]);

    const idResult = await transaction.query<Array<{ 'LAST_INSERT_ID()': number }>>('SELECT LAST_INSERT_ID()');
    const settlementId = idResult[0]['LAST_INSERT_ID()'];

    return SettleHelpersService.getSettlementById(transaction, settlementId);
  }

  static async createSettlementDebt(
    transaction: Transaction,
    byUser: number,
    namespaceId: number,
    settlementId: number,
    data: RecordData,
    settled: boolean,
    settledOn: Date | null,
    settledBy: number | null,
  ): Promise<SettlementDebt> {
    const now = new Date();
    const insertSql = `
      INSERT INTO \`SettlementDebt\` 
      (created, edited, createdBy, editedBy, namespaceId, settlementId, settled, data, settledOn, settledBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await transaction.query(insertSql, [
      now,
      now,
      byUser,
      byUser,
      namespaceId,
      settlementId,
      settled,
      JSON.stringify(data),
      settledOn,
      settledBy,
    ]);

    const idResult = await transaction.query<Array<{ 'LAST_INSERT_ID()': number }>>('SELECT LAST_INSERT_ID()');
    const settlementDebtId = idResult[0]['LAST_INSERT_ID()'];

    return SettleHelpersService.getSettlementDebtById(transaction, settlementDebtId);
  }

  static async getSettlementRecordViews(
    transaction: Transaction,
    settlementId: number,
  ): Promise<SettlementDebtView[]> {
    const sql = 'SELECT * FROM `SettlementDebt` WHERE settlementId = ?';
    const settlementDebts = await transaction.query<SettlementDebt[]>(sql, [settlementId]);

    const settlementDebtViews = await asyncMap<SettlementDebt, SettlementDebtView>(
      settlementDebts,
      async (settlementDebt) => {
        const data: RecordDataView = await NamespaceHelpersService.mapToRecordDataView(
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
  }

  static async setDebtIsSettled(
    transaction: Transaction,
    byUser: number,
    debtId: number,
    isSettled: boolean,
  ): Promise<void> {
    const now = new Date();
    const updateSql = `
      UPDATE \`SettlementDebt\`
      SET settled = ?,
          settledOn = ?,
          settledBy = ?,
          edited = ?,
          editedBy = ?
      WHERE id = ?
    `;
    await transaction.query(updateSql, [
      isSettled,
      isSettled ? now : null,
      isSettled ? byUser : null,
      now,
      byUser,
      debtId,
    ]);
  }
}

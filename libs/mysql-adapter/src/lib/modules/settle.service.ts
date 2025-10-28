import { Settlement, SettlementPayload, SettlementPreview, SettlementRecord, SettlementSettings, RecordData } from '@angular-monorepo/entities';
import { ISettleService } from '@angular-monorepo/data-adapter';
import { getTransactionContext } from '../mysql-adapter';
import { Logger, asyncMap } from '@angular-monorepo/utils';
import { NamespaceHelpersService } from './namespace.helpers.service';
import { SettleHelpersService } from './settle.helpers.service';

export class SettleService implements ISettleService {
  constructor(
    private readonly logger: Logger,
  ) {}

  async getSettleSettings(
    namespaceId: number,
    ownerId: number,
  ): Promise<SettlementSettings> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        return await transaction.jsonProcedure<SettlementSettings>(
          'call getSettlementSettings(?, ?);',
          [namespaceId, ownerId],
        );
      },
    );
  }

  async settleNamespacePreview(
    namespaceId: number,
    payload: SettlementPayload,
    ownerId: number,
  ): Promise<SettlementPreview> {
    // Calculate settlement records in TypeScript (debt simplification algorithm)
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const { settleRecords } = await SettleHelpersService.getSettleRecords(
          transaction,
          namespaceId,
          payload,
          ownerId,
        );
        const settings = await transaction.jsonProcedure<SettlementSettings>(
          'call getSettlementSettings(?, ?);',
          [namespaceId, ownerId],
        );

        // Convert RecordData to RecordDataView by mapping user IDs to User objects
        const settleRecordsData = await asyncMap<RecordData, SettlementRecord>(
          settleRecords,
          async (record) => {
            return {
              data: await NamespaceHelpersService
                .mapToRecordDataView(transaction, record),
              settled: false,
              settledBy: null,
              settledOn: null,
            };
          },
        );

        return {
          settleRecords: settleRecordsData,
          paymentEvents: settings.paymentEventsToSettle,
          namespace: settings.namespace,
        };
      },
    );
  }

  async settle(
    byUser: number,
    namespaceId: number,
    payload: SettlementPayload,
    ownerId: number,
  ): Promise<Settlement> {
    // Calculate settlement records in TypeScript (debt simplification algorithm)
    // Pass calculated records to procedure for persistence
    return getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const { settleRecords, recordsToSettle } = await SettleHelpersService.getSettleRecords(
          transaction,
          namespaceId,
          payload,
          ownerId,
        );
        const paymentEventIds = recordsToSettle.map(r => r.paymentEventId);

        const result = await transaction.jsonProcedure<Settlement>(
          'call createSettlementFromRecords(?, ?, ?, ?);',
          [
            byUser,
            namespaceId,
            JSON.stringify(paymentEventIds),
            JSON.stringify(settleRecords),
          ],
        );
        return result;
      },
    );
  }

  async setDebtIsSettled(
    byUser: number,
    debtId: number,
    isSettled: boolean,
  ): Promise<void> {
    return getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        await transaction.jsonProcedure<{ success: boolean }>(
          'call setDebtIsSettled(?, ?, ?);',
          [byUser, debtId, isSettled],
        );
      },
    );
  }
}

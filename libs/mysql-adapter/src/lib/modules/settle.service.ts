import { ERROR_CODE, paymentEventsToRecordsWithIds, RecordData, Settlement, SettlementPayload, SettlementPreview, SettlementRecord, SettlementSettings } from '@angular-monorepo/entities';
import { settle, deptToRecordData } from '@angular-monorepo/debt-simplification';
import { getTransactionContext } from '../mysql-adapter';
import { Logger, asyncMap } from '@angular-monorepo/utils';
import { NamespaceHelpersService } from './namespace.helpers.service';
import { PaymentEventHelpersService } from './payment-event.helpers.service';
import { SettleHelpersService } from './settle.helpers.service';

export class SettleService {
  constructor(
    private readonly logger: Logger,
  ) {}

  private async getSettleRecords(
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
      { logger: this.logger },
      (transaction) => {
        return PaymentEventHelpersService
          .getNamespacePaymentEvents(transaction, namespaceId, ownerId);
      },
    );

    const paymentEventsToSettle = paymentEvents.filter(pe => payload.paymentEvents.includes(pe.id));

    if (paymentEventsToSettle.find(record => record.settlementId !== null))
      throw Error(ERROR_CODE.USER_ACTION_CONFLICT);

    const recordsToSettle = paymentEventsToRecordsWithIds(paymentEventsToSettle);

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
  }

  async getSettleSettings(
    namespaceId: number,
    ownerId: number,
  ): Promise<SettlementSettings> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const paymentEvents = await PaymentEventHelpersService
          .getNamespacePaymentEventsView(transaction, namespaceId, ownerId);
        return {
          paymentEventsToSettle: paymentEvents.filter(pe => !pe.settlementId),
          namespace: await NamespaceHelpersService
            .getNamespaceViewForOwner(transaction, namespaceId, ownerId),
        };
      },
    );
  }

  async settleNamespacePreview(
    namespaceId: number,
    payload: SettlementPayload,
    ownerId: number,
  ): Promise<SettlementPreview> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const { settleRecords } = await this.getSettleRecords(namespaceId, payload, ownerId);

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
          paymentEvents: await PaymentEventHelpersService
            .getNamespacePaymentEventsView(transaction, namespaceId, ownerId),
          namespace: await NamespaceHelpersService
            .getNamespaceViewForOwner(transaction, namespaceId, ownerId),
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
    return getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const { settleRecords, recordsToSettle } = await this.getSettleRecords(namespaceId, payload, ownerId);

        const settlement = await SettleHelpersService.createSettlement(
          transaction,
          byUser,
          namespaceId,
        );

        await asyncMap(
          settleRecords,
          async (record) => await SettleHelpersService.createSettlementDebt(
            transaction,
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
        await SettleHelpersService.setDebtIsSettled(
          transaction,
          byUser,
          debtId,
          isSettled,
        );
      },
    );
  }
}

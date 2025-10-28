import { RecordData, ERROR_CODE, paymentEventsToRecordsWithIds, SettlementPayload } from '@angular-monorepo/entities';
import { settle, deptToRecordData } from '@angular-monorepo/debt-simplification';
import { Transaction } from '../mysql-adapter';
import { PaymentEventHelpersService } from './payment-event.helpers.service';

export class SettleHelpersService {

  static async getSettleRecords(
    transaction: Transaction,
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
    const paymentEvents = await PaymentEventHelpersService
      .getNamespacePaymentEvents(transaction, namespaceId, ownerId);

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
}

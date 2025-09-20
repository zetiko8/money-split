import { GuiError, PaymentEvent, PaymentEventView, PaymentNode, RecordData } from './index';

/**
 * Groups payment nodes by currency and sums their amounts
 */
export function getAllCurrenciesForPaymentEventView(
  nodes: PaymentEventView[],
): string[] {
  const currencies = new Set<string>();

  for (const node of nodes) {
    node.paidBy.forEach(n => currencies.add(n.currency));
    node.benefitors.forEach(n => currencies.add(n.currency));
  }

  return [...currencies];
}

/**
 * Groups payment nodes by currency and sums their amounts
 */
export function sumPaymentNodesByCurrency(nodes: PaymentNode[]): Map<string, number> {
  const sums = new Map<string, number>();

  for (const node of nodes) {
    const current = sums.get(node.currency) || 0;
    sums.set(node.currency, current + node.amount);
  }

  return sums;
}

/**
 * Validates that total amount paid equals total amount owed for each currency
 * @throws Error if amounts don't match for any currency
 */
export function validatePaymentAmounts(
  paidBy: PaymentNode[],
  benefitors: PaymentNode[],
): void {
  const paidSums = sumPaymentNodesByCurrency(paidBy);
  const owedSums = sumPaymentNodesByCurrency(benefitors);

  // Check that currencies match
  const allCurrencies = new Set([...paidSums.keys(), ...owedSums.keys()]);

  for (const currency of allCurrencies) {
    const paidAmount = paidSums.get(currency) || 0;
    const owedAmount = owedSums.get(currency) || 0;

    if (paidAmount !== owedAmount) {
      const error
        = new Error(`Amount mismatch for ${currency}: paid ${paidAmount} but owed ${owedAmount}`);
      (error as GuiError).details = {
        paidAmount,
        owedAmount,
        currency,
      };
      throw error;
    }
  }
}

export const paymentEventsToRecords = (paymentEvents: PaymentEvent[]) => {
  const records: RecordData[] = paymentEventsToRecordsWithIds(paymentEvents).map(r => r.record);
  return records;
};

export const paymentEventsToRecordsWithIds
  = (paymentEvents: PaymentEvent[]): {
    paymentEventId: number,
    record: RecordData
  }[] => {
    const records: {
      paymentEventId: number,
      record: RecordData
    }[] = [];

    for (const paymentEvent of paymentEvents) {
      const paidBy = paymentEvent.paidBy;
      const benefitors = paymentEvent.benefitors;
      const paidByByCurrencies = new Map<string, PaymentNode[]>();
      const benefitorsByCurrencies = new Map<string, PaymentNode[]>();

      for (const node of paidBy) {
        const current = paidByByCurrencies.get(node.currency) || [];
        paidByByCurrencies.set(node.currency, [...current, node]);
      }
      for (const node of benefitors) {
        const current = benefitorsByCurrencies.get(node.currency) || [];
        benefitorsByCurrencies.set(node.currency, [...current, node]);
      }

      for (const [currency, paidByNodes] of paidByByCurrencies) {
        const benefitorNodes = benefitorsByCurrencies.get(currency) || [];
        records.push({
          paymentEventId: paymentEvent.id,
          record: {
            currency,
            paidBy: paidByNodes.map(node => node.userId),
            benefitors: benefitorNodes.map(node => node.userId),
            cost: paidByNodes.reduce((acc, node) => acc + node.amount, 0),
          },
        });
      }
    }

    return records;
  };


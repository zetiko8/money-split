import { RecordData } from '@angular-monorepo/entities';
import { settle } from '.';
import { validateFinalDifference, validateNoRedundantTransactions, validateTotalDebtMatchesCredit } from './test.helper';

describe('settle', () => {
  it('Some users partially reimburse a payer, but others also contributed expenses separately.', () => {
    const transactions: RecordData[] = [
      { benefitors: [2, 3], cost: 60, currency: 'EUR', paidBy: [1] }, // 30 EUR each for 2 and 3
      { benefitors: [1, 3], cost: 30, currency: 'EUR', paidBy: [2] }, // 15 EUR each for 1 and 3
      { benefitors: [1, 2], cost: 20, currency: 'EUR', paidBy: [3] }, // 10 EUR each for 1 and 2
    ];

    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, { 1: 0, 2: 0, 3: 0 });
    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3]);
  });
});
import { settle } from '.';
import { RecordData } from '@angular-monorepo/entities';
import { validateFinalDifference, validateTotalDebtMatchesCredit, validateNoRedundantTransactions } from './test.helper';

describe('settle', () => {
  it('Overlapping payments and benefits: Some users contribute more but benefit differently', () => {
    const transactions: RecordData[] = [
      {
        benefitors: [2, 3, 4],
        cost: 60,
        currency: 'EUR',
        paidBy: [1], // Paid 60 -> Each of 2, 3, 4 benefits 20
      },
      {
        benefitors: [1, 4],
        cost: 20,
        currency: 'EUR',
        paidBy: [2], // Paid 20 -> Each of 1, 4 benefits 10
      },
      {
        benefitors: [1, 2, 3],
        cost: 90,
        currency: 'EUR',
        paidBy: [3], // Paid 90 -> Each of 1, 2, 3 benefits 30
      },
      {
        benefitors: [2, 3],
        cost: 40,
        currency: 'EUR',
        paidBy: [4], // Paid 40 -> Each of 2, 3 benefits 20
      },
    ];

    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    });
    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3, 4]);
  });
});

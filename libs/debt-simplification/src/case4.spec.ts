import { settle } from '.';
import { RecordData } from '@angular-monorepo/entities';
import { validateFinalDifference, validateNoRedundantTransactions, validateTotalDebtMatchesCredit } from './test.helper';

describe('settle', () => {
  it('Circular debt: User 1 pays User 2, User 2 pays User 3, User 3 pays User 4, and User 4 pays User 1', () => {
    const transactions: RecordData[] = [
      {
        benefitors: [2],
        cost: 40,
        currency: 'EUR',
        paidBy: [1],
      },
      {
        benefitors: [3],
        cost: 40,
        currency: 'EUR',
        paidBy: [2],
      },
      {
        benefitors: [4],
        cost: 40,
        currency: 'EUR',
        paidBy: [3],
      },
      {
        benefitors: [1],
        cost: 40,
        currency: 'EUR',
        paidBy: [4],
      },
    ];

    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    });

    expect(debts).toEqual([]); // ✅ No transactions should be needed

    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3, 4]);
  });
});

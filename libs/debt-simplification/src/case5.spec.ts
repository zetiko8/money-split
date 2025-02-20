import { settle } from '.';
import { RecordData } from '@angular-monorepo/entities';
import { validateFinalDifference, validateNoRedundantTransactions, validateTotalDebtMatchesCredit } from './test.helper';

describe('settle', () => {
  it('One user covers all expenses, others must repay them proportionally', () => {
    const transactions: RecordData[] = [
      {
        benefitors: [2, 3, 4],
        cost: 120,
        currency: 'EUR',
        paidBy: [1],
      },
    ];

    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    });

    expect(debts).toEqual([
      { debtor: 2, creditor: 1, value: 40 },
      { debtor: 3, creditor: 1, value: 40 },
      { debtor: 4, creditor: 1, value: 40 },
    ]); // ✅ Each user owes exactly 40 EUR to User 1.

    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3, 4]);
  });;
});

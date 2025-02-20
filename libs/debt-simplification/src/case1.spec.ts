import { RecordData } from '@angular-monorepo/entities';
import { settle } from '.';
import { validateFinalDifference, validateTotalDebtMatchesCredit, validateNoRedundantTransactions } from './test.helper';

describe('settle', () => {
  it('User 1 bought groceries for users 2, 3, and 4. User 2 paid for a dinner for users 1 and 3. User 3 paid for a movie ticket for users 1 and 2.', () => {
    const transactions: RecordData[] = [
      {
        benefitors: [2, 3, 4],
        cost: 30,
        currency: 'EUR',
        paidBy: [1],
      },
      {
        benefitors: [1, 3],
        cost: 20,
        currency: 'EUR',
        paidBy: [2],
      },
      {
        benefitors: [1, 2],
        cost: 15,
        currency: 'EUR',
        paidBy: [3],
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

import { RecordData } from '@angular-monorepo/entities';
import { settle } from '.';
import { validateFinalDifference, validateNoRedundantTransactions, validateTotalDebtMatchesCredit } from './test.helper';

describe('settle', () => {
  it('A large group where one person covers most costs, but a few others contribute partially.', () => {
    const transactions: RecordData[] = [
      { benefitors: [2, 3, 4, 5, 6], cost: 500, currency: 'EUR', paidBy: [1] }, // User 1 covers almost everything
      { benefitors: [1, 2, 3], cost: 90, currency: 'EUR', paidBy: [3] }, // User 3 helps a bit
      { benefitors: [3, 4, 5], cost: 60, currency: 'EUR', paidBy: [5] }, // User 5 helps a bit
    ];

    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3, 4, 5, 6]);
  });
});
import { settle } from '.';
import { RecordData } from '@angular-monorepo/entities';
import { validateFinalDifference } from './test.helper';

describe('settle', () => {
  it('User 1 paid for a group lunch for users 2, 3, and 4. User 2 paid for a taxi ride for users 1 and 3. User 4 paid for a hotel room for users 1, 2, and 3.', () => {
    const transactions: RecordData[] = [
      {
        benefitors: [2, 3, 4],
        cost: 40,
        currency: 'EUR',
        paidBy: [1],
      },
      {
        benefitors: [1, 3],
        cost: 25,
        currency: 'EUR',
        paidBy: [2],
      },
      {
        benefitors: [1, 2, 3],
        cost: 60,
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
  });
});

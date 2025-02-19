import { settle } from '.';
import { RecordData } from '@angular-monorepo/entities';
import { validateFinalDifference } from './test.helper';

describe('settle', () => {
  it('User 1 paid for a concert ticket for users 2 and 3. User 2 paid for a dinner for users 1, 3, and 4. User 3 paid for a coffee for users 1 and 2. User 4 paid for a museum ticket for users 1, 2, and 3.', () => {
    const transactions: RecordData[] = [
      {
        benefitors: [2, 3],
        cost: 50,
        currency: 'EUR',
        paidBy: [1],
      },
      {
        benefitors: [1, 3, 4],
        cost: 30,
        currency: 'EUR',
        paidBy: [2],
      },
      {
        benefitors: [1, 2],
        cost: 10,
        currency: 'EUR',
        paidBy: [3],
      },
      {
        benefitors: [1, 2, 3],
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
  });
});

import { RecordData } from '@angular-monorepo/entities';
import { settle } from '.';
import { validateDebtValueRounded, validateDebtsArrayRounded, validateFinalDifference, validateNoRedundantTransactions, validateTotalDebtMatchesCredit } from './test.helper';

describe('settle', () => {
  it('development case', () => {
    const transactions = [
      {
        benefitors: [2, 3, 1],
        cost: 10,
        currency: 'EUR',
        paidBy: [4, 1],
      },
      {
        benefitors: [4],
        cost: 2,
        currency: 'EUR',
        paidBy: [3],
      },
      {
        benefitors: [3],
        cost: 1,
        currency: 'EUR',
        paidBy: [4],
      },
      {
        benefitors: [1],
        cost: 2,
        currency: 'EUR',
        paidBy: [4],
      },
      {
        benefitors: [3, 4],
        cost: 5,
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
    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3, 4]);

    expect(debts).toHaveLength(3);
    expect(debts[0].creditor).toBe(4);
    expect(debts[0].debtor).toBe(1);
    validateDebtValueRounded(debts[0].value, 0.3333333);
    expect(debts[1].creditor).toBe(4);
    expect(debts[1].debtor).toBe(2);
    validateDebtValueRounded(debts[1].value, 3.3333333);
    expect(debts[2].creditor).toBe(4);
    expect(debts[2].debtor).toBe(3);
    validateDebtValueRounded(debts[2].value, 4.8333333);
  });
  it ('simple', () => {
    const debts = settle([
      {
        benefitors: [2],
        cost: 10,
        currency: 'EUR',
        paidBy: [1],
      },
    ]);

    expect(debts).toHaveLength(1);
    expect(debts[0].creditor).toBe(1);
    expect(debts[0].debtor).toBe(2);
    validateDebtValueRounded(debts[0].value, 10);
  });
  it ('simple loop', () => {
    const debts = settle([
      {
        benefitors: [2],
        cost: 10,
        currency: 'EUR',
        paidBy: [1],
      },
      {
        benefitors: [1],
        cost: 10,
        currency: 'EUR',
        paidBy: [2],
      },
    ]);

    expect(debts).toHaveLength(0);
  });
  it ('tripple loop', () => {
    const debts = settle([
      {
        benefitors: [2],
        cost: 10,
        currency: 'EUR',
        paidBy: [1],
      },
      {
        benefitors: [3],
        cost: 10,
        currency: 'EUR',
        paidBy: [2],
      },
      {
        benefitors: [1],
        cost: 10,
        currency: 'EUR',
        paidBy: [3],
      },
    ]);

    expect(debts).toHaveLength(0);
  });
  it ('complex 1', () => {
    const transactions = [
      {
        benefitors: [1, 2, 3],
        cost: 9,
        currency: 'EUR',
        paidBy: [1],
      },
      {
        benefitors: [3],
        cost: 2,
        currency: 'EUR',
        paidBy: [2],
      },
    ];
    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, {
      1: 0,
      2: 0,
      3: 0,
    });
    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3]);
  });
  it('complex 2', () => {
    const transactions = [
      {
        benefitors: [1, 2, 3],
        cost: 9,
        currency: 'EUR',
        paidBy: [1],
      },
      {
        benefitors: [3],
        cost: 2,
        currency: 'EUR',
        paidBy: [2],
      },
      {
        benefitors: [4],
        cost: 3,
        currency: 'EUR',
        paidBy: [2],
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
  it('complex 3', () => {
    const transactions = [
      {
        benefitors: [1, 2, 3],
        cost: 9,
        currency: 'EUR',
        paidBy: [1],
      },
      {
        benefitors: [3],
        cost: 2,
        currency: 'EUR',
        paidBy: [2],
      },
      {
        benefitors: [4],
        cost: 3,
        currency: 'EUR',
        paidBy: [2],
      },
      {
        benefitors: [3],
        cost: 2,
        currency: 'EUR',
        paidBy: [2],
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
  it('complex 4', () => {
    const transactions = [
      {
        benefitors: [1, 2, 3],
        cost: 9,
        currency: 'EUR',
        paidBy: [1],
      },
      {
        benefitors: [3],
        cost: 2,
        currency: 'EUR',
        paidBy: [2],
      },
      {
        benefitors: [4],
        cost: 3,
        currency: 'EUR',
        paidBy: [2],
      },
      {
        benefitors: [4],
        cost: 1,
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
  it('cypress tests case', () => {
    const debts = settle([
      {
        benefitors: [2, 3, 4],
        cost: 4,
        currency: 'SIT',
        paidBy: [1],
      },
      {
        benefitors: [2, 3, 4],
        cost: 10,
        currency: 'SIT',
        paidBy: [1],
      },
      {
        benefitors: [2, 3, 4],
        cost: 5.4,
        currency: 'SIT',
        paidBy: [1],
      },
      {
        benefitors: [2, 3, 4],
        cost: 3,
        currency: 'SIT',
        paidBy: [1],
      },
    ]);

    validateDebtsArrayRounded(debts, [
      { creditor: 1, debtor: 2, value: 7.4666667 },
      { creditor: 1, debtor: 3, value: 7.4666667 },
      { creditor: 1, debtor: 4, value: 7.4666667 },
    ]);
  });
});

describe('settle - Sanity Checks', () => {

  // ✅ Test 1: No Transactions → No debts should be created
  it('Should return an empty array when there are no transactions', () => {
    const transactions: RecordData[] = [];
    const debts = settle(transactions);
    expect(debts).toEqual([]); // No transactions, no debts should exist
  });

  // ✅ Test 2: Single User Pays For Themselves → No debts should be created
  it('Should return an empty array when a user only pays for themselves', () => {
    const transactions: RecordData[] = [
      { benefitors: [1], cost: 50, currency: 'EUR', paidBy: [1] }, // User 1 pays for themselves
    ];
    const debts = settle(transactions);
    expect(debts).toEqual([]); // No one owes anyone
  });

  // ✅ Test 3: One User Pays for Another → The direct debt should match
  it('Should correctly assign debt when one user pays for another', () => {
    const transactions: RecordData[] = [
      { benefitors: [2], cost: 30, currency: 'EUR', paidBy: [1] }, // User 1 pays for User 2
    ];
    const debts = settle(transactions);
    expect(debts).toEqual([
      { debtor: 2, creditor: 1, value: 30 }, // User 2 should owe 30 to User 1
    ]);
  });

  // ✅ Test 4: Two Users Share A Cost → Each owes an equal share
  it('Should split the cost equally when two users benefit from a shared expense', () => {
    const transactions: RecordData[] = [
      { benefitors: [2, 3], cost: 40, currency: 'EUR', paidBy: [1] }, // User 1 pays, Users 2 & 3 benefit
    ];
    const debts = settle(transactions);
    expect(debts).toEqual([
      { debtor: 2, creditor: 1, value: 20 }, // Each owes 20 to User 1
      { debtor: 3, creditor: 1, value: 20 },
    ]);
  });

  // ✅ Test 5: Multiple People Pay Equally → No debts should be created
  it('Should not create debts when multiple users pay equal amounts for shared expenses', () => {
    const transactions: RecordData[] = [
      { benefitors: [1, 2], cost: 20, currency: 'EUR', paidBy: [1, 2] }, // Each pays 10 EUR out of 20
    ];
    const debts = settle(transactions);
    expect(debts).toEqual([]); // Both paid exactly their share, no debts
  });

  // ✅ Test 6: Two Users Fully Settle a Cost → No debts should remain
  it('Should cancel out debts when two users pay for each other equally', () => {
    const transactions: RecordData[] = [
      { benefitors: [2], cost: 20, currency: 'EUR', paidBy: [1] },
      { benefitors: [1], cost: 20, currency: 'EUR', paidBy: [2] },
    ];
    const debts = settle(transactions);
    expect(debts).toEqual([]); // They both paid for each other equally, no debts
  });

  // ✅ Test 7: One Person Covers Everything for Multiple People → All others owe equally
  it('Should correctly distribute debt when one person covers the entire cost for multiple users', () => {
    const transactions: RecordData[] = [
      { benefitors: [2, 3, 4], cost: 60, currency: 'EUR', paidBy: [1] }, // User 1 pays all 60
    ];
    const debts = settle(transactions);
    expect(debts).toEqual([
      { debtor: 2, creditor: 1, value: 20 }, // Each owes 20 to User 1
      { debtor: 3, creditor: 1, value: 20 },
      { debtor: 4, creditor: 1, value: 20 },
    ]);
  });
});

describe('settle - Malformed Data Tests', () => {

  // ✅ Test 1: Transactions are not an array (Invalid type)
  it('Should throw an error when transactions input is not an array', () => {
    expect(() => settle(null as any)).toThrow('Invalid input: transactions must be an array');
    expect(() => settle(undefined as any)).toThrow('Invalid input: transactions must be an array');
    expect(() => settle({} as any)).toThrow('Invalid input: transactions must be an array');
  });

  // ✅ Test 2: Transaction missing required fields
  it('Should throw an error when transaction is missing required fields', () => {
    const transactions = [
      { benefitors: [2, 3], cost: 50 }, // ❌ Missing 'paidBy'
    ];

    expect(() => settle(transactions as any)).toThrow('Invalid transaction: benefitors and paidBy must be arrays');
  });

  // ✅ Test 3: Negative or zero costs
  it('Should throw an error when a transaction has a negative or zero cost', () => {
    const transactions = [
      { benefitors: [2, 3], cost: -10, currency: 'EUR', paidBy: [1] }, // ❌ Negative cost
    ];

    expect(() => settle(transactions)).toThrow('Invalid transaction: cost must be a positive number');

    const zeroCostTransactions = [
      { benefitors: [2, 3], cost: 0, currency: 'EUR', paidBy: [1] }, // ❌ Zero cost
    ];

    expect(() => settle(zeroCostTransactions)).toThrow('Invalid transaction: cost must be a positive number');
  });

  // ✅ Test 4: Benefitors or paidBy are not arrays
  it('Should throw an error when benefitors or paidBy are not arrays', () => {
    const transactions = [
      { benefitors: 2 as any, cost: 30, currency: 'EUR', paidBy: [1] }, // ❌ benefitors should be an array
    ];

    expect(() => settle(transactions)).toThrow('Invalid transaction: benefitors and paidBy must be arrays');

    const transactions2 = [
      { benefitors: [2, 3], cost: 30, currency: 'EUR', paidBy: '1' as any }, // ❌ paidBy should be an array
    ];

    expect(() => settle(transactions2)).toThrow('Invalid transaction: benefitors and paidBy must be arrays');
  });

  // ✅ Test 5: Non-numeric IDs in paidBy or benefitors
  it('Should throw an error when benefitors or paidBy contain non-numeric user IDs', () => {
    const transactions = [
      { benefitors: ['two' as any, 3], cost: 30, currency: 'EUR', paidBy: [1] }, // ❌ "two" is not a number
    ];

    expect(() => settle(transactions)).toThrow('Invalid transaction: all benefitors and paidBy entries must be numbers');
  });

  // ✅ Test 6: Cost is missing or undefined
  it('Should throw an error when cost is missing or not a valid number', () => {
    const transactions = [
      { benefitors: [2, 3], currency: 'EUR', paidBy: [1] }, // ❌ Missing cost
    ];

    expect(() => settle(transactions as any)).toThrow('Invalid transaction: cost must be a positive number');

    const transactions2 = [
      { benefitors: [2, 3], cost: null as any, currency: 'EUR', paidBy: [1] }, // ❌ cost is null
    ];

    expect(() => settle(transactions2)).toThrow('Invalid transaction: cost must be a positive number');
  });

});
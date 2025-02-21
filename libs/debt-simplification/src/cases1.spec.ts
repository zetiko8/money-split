import { RecordData } from '@angular-monorepo/entities';
import { settle } from '.';
import { validateFinalDifference, validateNoRedundantTransactions, validateTotalDebtMatchesCredit } from './test.helper';

describe('settle', () => {
  // ✅ Existing test case (some users partially reimburse each other)
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

  // ✅ Test 1: Large group with one primary payer
  it('A large group where one person pays for all expenses and users must repay them proportionally.', () => {
    const transactions: RecordData[] = [
      { benefitors: [2, 3, 4, 5, 6], cost: 250, currency: 'EUR', paidBy: [1] }, // 50 EUR per user
    ];
    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3, 4, 5, 6]);
  });

  // ✅ Test 2: Fully circular debt setup
  it('Circular payments should result in zero transactions since debts cancel out.', () => {
    const transactions: RecordData[] = [
      { benefitors: [2], cost: 40, currency: 'EUR', paidBy: [1] },
      { benefitors: [3], cost: 40, currency: 'EUR', paidBy: [2] },
      { benefitors: [4], cost: 40, currency: 'EUR', paidBy: [3] },
      { benefitors: [1], cost: 40, currency: 'EUR', paidBy: [4] },
    ];
    const debts = settle(transactions);

    expect(debts).toEqual([]); // No transactions should be needed

    validateFinalDifference(transactions, debts, { 1: 0, 2: 0, 3: 0, 4: 0 });
    validateTotalDebtMatchesCredit(debts);
  });

  // ✅ Test 3: Fractional amounts
  it('Ensures the computation properly handles fractional amounts (avoiding floating-point errors).', () => {
    const transactions: RecordData[] = [
      { benefitors: [2, 3, 4], cost: 99.99, currency: 'EUR', paidBy: [1] }, // 33.33 EUR each
    ];
    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, { 1: 0, 2: 0, 3: 0, 4: 0 });
    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3, 4]);
  });

  // ✅ Test 4: Splitting payments among multiple payers
  it('Should correctly distribute repayments when multiple users jointly pay for a single expense.', () => {
    const transactions: RecordData[] = [
      { benefitors: [1, 2, 3], cost: 90, currency: 'EUR', paidBy: [2, 3] }, // Both 2 and 3 shared the cost
    ];
    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, { 1: 0, 2: 0, 3: 0 });
    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3]);
  });

  // ✅ Test 5: Random complex debt redistribution
  it('Complex payment structure with multiple contributors and beneficiaries.', () => {
    const transactions: RecordData[] = [
      { benefitors: [2, 3], cost: 45, currency: 'EUR', paidBy: [1] }, // Should owe 22.5 each
      { benefitors: [1, 3], cost: 25, currency: 'EUR', paidBy: [2] }, // Should owe 12.5 each
      { benefitors: [1, 2], cost: 30, currency: 'EUR', paidBy: [3] }, // Should owe 15 each
    ];
    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, { 1: 0, 2: 0, 3: 0 });
    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3]);
  });

  // ✅ Test 6: Overlapping contributions
  it('Users both pay and benefit in different transactions, ensuring correct tracking.', () => {
    const transactions: RecordData[] = [
      { benefitors: [2, 3], cost: 100, currency: 'EUR', paidBy: [1] }, // User 1 pays
      { benefitors: [1, 3], cost: 50, currency: 'EUR', paidBy: [2] }, // User 2 pays
      { benefitors: [1, 2], cost: 80, currency: 'EUR', paidBy: [3] }, // User 3 pays
    ];
    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, { 1: 0, 2: 0, 3: 0 });
    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3]);
  });

  // ✅ Test 7: One person is always a creditor
  it('One user pays most expenses and must be reimbursed by multiple people.', () => {
    const transactions: RecordData[] = [
      { benefitors: [2, 3, 4, 5], cost: 200, currency: 'EUR', paidBy: [1] }, // 50 each
      { benefitors: [1, 3], cost: 60, currency: 'EUR', paidBy: [2] }, // 30 each
    ];
    const debts = settle(transactions);

    validateFinalDifference(transactions, debts, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    validateTotalDebtMatchesCredit(debts);
    validateNoRedundantTransactions(debts, [1, 2, 3, 4, 5]);
  });

  // ✅ Test 8: No transactions needed
  it('If all users paid exactly what they benefited, no transactions should be made.', () => {
    const transactions: RecordData[] = [
      { benefitors: [1], cost: 50, currency: 'EUR', paidBy: [1] },
      { benefitors: [2], cost: 30, currency: 'EUR', paidBy: [2] },
    ];
    const debts = settle(transactions);

    expect(debts).toEqual([]); // No debts should be generated
  });
});
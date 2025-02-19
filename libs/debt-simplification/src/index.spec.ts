import { settle } from '.';
import { validateDebtValueRounded, validateDebtsArrayRounded } from './test.helper';

describe('settle', () => {
  it('development case', () => {
    const debts = settle([
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
    ]);

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
    const debts = settle([
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
    ]);

    expect(debts).toHaveLength(2);
    expect(debts[0].creditor).toBe(1);
    expect(debts[0].debtor).toBe(3);
    validateDebtValueRounded(debts[0].value, 6);
    expect(debts[1].creditor).toBe(3);
    expect(debts[1].debtor).toBe(2);
    validateDebtValueRounded(debts[1].value, 1);
  });
  it('complex 2', () => {
    const debts = settle([
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
    ]);

    expect(debts).toHaveLength(3);
    expect(debts[0].creditor).toBe(1);
    expect(debts[0].debtor).toBe(3);
    validateDebtValueRounded(debts[0].value, 6);
    expect(debts[1].creditor).toBe(3);
    expect(debts[1].debtor).toBe(2);
    validateDebtValueRounded(debts[1].value, 1);
    expect(debts[2].creditor).toBe(2);
    expect(debts[2].debtor).toBe(4);
    validateDebtValueRounded(debts[2].value, 3);
  });
  it('complex 3', () => {
    const debts = settle([
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
    ]);

    expect(debts).toHaveLength(3);
    validateDebtValueRounded(debts[0].value, 6);
    validateDebtValueRounded(debts[1].value, 1);
    validateDebtValueRounded(debts[2].value, 3);
  });
  it('complex 4', () => {
    const debts = settle([
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
    ]);

    validateDebtsArrayRounded(debts, [
      { creditor: 1, debtor: 3, value: 6 },
      { creditor: 2, debtor: 4, value: 2 },
      { creditor: 3, debtor: 4, value: 2 },
    ]);
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

import { RecordData, Debt } from '@angular-monorepo/entities';

export const calculatePaid = (transactions: RecordData[]): { [key: number]: number } => {
  const paid: { [key: number]: number } = {};
  transactions.forEach(({ paidBy, cost }) => {
    paidBy.forEach((payer) => {
      if (!paid[payer]) {
        paid[payer] = 0;
      }
      paid[payer] += cost / paidBy.length;
    });
  });
  Object.keys(paid).forEach(key => {
    paid[Number(key)] = roundToSevenDecimals(paid[Number(key)]);
  });
  return paid;
};

export const calculateBenefited = (transactions: RecordData[]): { [key: number]: number } => {
  const benefited: { [key: number]: number } = {};
  transactions.forEach(({ benefitors, cost }) => {
    benefitors.forEach((benefitor) => {
      if (!benefited[benefitor]) {
        benefited[benefitor] = 0;
      }
      benefited[benefitor] += cost / benefitors.length;
    });
  });
  Object.keys(benefited).forEach(key => {
    benefited[Number(key)] = roundToSevenDecimals(benefited[Number(key)]);
  });
  return benefited;
};

export const calculateDifference = (paid: { [key: number]: number }, benefited: { [key: number]: number }): { [key: number]: number } => {
  const difference: { [key: number]: number } = {};
  const allUsers = new Set([...Object.keys(paid), ...Object.keys(benefited)]);
  allUsers.forEach(user => {
    const paidAmount = paid[Number(user)] || 0;
    const benefitedAmount = benefited[Number(user)] || 0;
    difference[Number(user)] = roundToSevenDecimals(benefitedAmount - paidAmount);
  });
  return difference;
};

export const applyDebts = (difference: { [key: number]: number }, debts: Debt[]): { [key: number]: number } => {
  debts.forEach(({ creditor, debtor, value }) => {
    difference[creditor] += value;
    difference[debtor] -= value;
  });
  return difference;
};

export const validateFinalDifference = (transactions: RecordData[], debts: Debt[], expected: { [key: number]: number }) => {
  const paid = calculatePaid(transactions);
  const benefited = calculateBenefited(transactions);
  const difference = calculateDifference(paid, benefited);
  const finalDifference = applyDebts({ ...difference }, debts);
  validateRoundedDifference(finalDifference, expected);
};

export const validateRoundedDifference = (actual: { [key: number]: number }, expected: { [key: number]: number }) => {
  const roundedExpected: { [key: number]: number } = {};
  Object.entries(expected).forEach(([key, value]) => {
    roundedExpected[Number(key)] = roundToSevenDecimals(value);
  });
  const roundedActual: { [key: number]: number } = {};
  Object.entries(actual).forEach(([key, value]) => {
    roundedActual[Number(key)] = roundToSevenDecimals(value);
  });
  expect(roundedActual).toEqual(roundedExpected);
};

export const validateDebtValueRounded = (actual: number, expected: number) => {
  const roundedActual = roundToSevenDecimals(actual);
  const roundedExpected = roundToSevenDecimals(expected);
  expect(roundedActual).toBe(roundedExpected);
};

export const validateDebtsArrayRounded = (actual: Debt[], expected: Debt[]) => {
  expect(actual.length).toBe(expected.length);
  actual.forEach((debt, index) => {
    const roundedDebt = {
      ...debt,
      value: roundToSevenDecimals(debt.value),
    };
    expect(roundedDebt).toEqual(expected[index]);
  });
};

export const roundToSevenDecimals = (value: number): number => {
  const roundedValue = Math.round((value + Number.EPSILON) * 10000000) / 10000000;
  return roundedValue === 0 ? 0 : roundedValue;
};

export function validateTotalDebtMatchesCredit(debts: Debt[]): void {
  let totalDebt = 0;
  let totalCredit = 0;

  for (const debt of debts) {
    totalDebt += debt.value;    // Sum total money owed
    totalCredit += debt.value;  // Sum total money received
  }

  expect(totalDebt).toBeCloseTo(totalCredit, 7);  // Floating point safe comparison
}

export function validateNoRedundantTransactions(debts: Debt[], users: number[]): void {
  const netBalances: Record<number, number> = {};

  for (const user of users) netBalances[user] = 0;

  for (const debt of debts) {
    netBalances[debt.debtor] -= debt.value;
    netBalances[debt.creditor] += debt.value;
  }

  // There should be no leftover "unnecessary" payments occurring.
  const debtors = debts.map(d => d.debtor);
  const uniqueDebtors = new Set(debtors);

  expect(uniqueDebtors.size).toBeLessThanOrEqual(users.length - 1);

  // If someone owes money but could settle by merging transactions, detect that.
  // Map to track how much each user is owed (credit) or owes (debt)
  const balanceMap = new Map<number, number>();

  // Compute individual net balances
  for (const { debtor, creditor, value } of debts) {
    balanceMap.set(debtor, (balanceMap.get(debtor) || 0) - value);
    balanceMap.set(creditor, (balanceMap.get(creditor) || 0) + value);
  }

  for (const { debtor } of debts) {
    /**
     * A redundant transaction exists if:
     * - Debtor received money from someone BUT is then paying it forward to someone else (middleman).
     */
    if (balanceMap.has(debtor) && balanceMap.get(debtor)! > 0) {
      throw Error(`Redundant transaction detected: User ${debtor} is both receiving and forwarding money. Transactions can be optimized.`);
    }
  }
}

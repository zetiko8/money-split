import { Debt, RecordData } from '@angular-monorepo/entities';

export function deptToRecordData (
  debt: Debt,
  currency: string,
): RecordData {
  return {
    benefitors: [debt.debtor],
    cost: debt.value,
    currency,
    paidBy: [debt.creditor],
  };
}

export function settle(transactions: RecordData[]): Debt[] {

  if (!Array.isArray(transactions)) {
    throw new Error('Invalid input: transactions must be an array');
  }

  for (const transaction of transactions) {
    if (!transaction || typeof transaction !== 'object') {
      throw new Error('Invalid transaction: transactions must be objects');
    }

    const { benefitors, cost, paidBy } = transaction;

    if (!Array.isArray(benefitors) || !Array.isArray(paidBy)) {
      throw new Error('Invalid transaction: benefitors and paidBy must be arrays');
    }

    if (!benefitors.length || !paidBy.length) {
      throw new Error('Invalid transaction: benefitors and paidBy must contain at least one user');
    }

    if (typeof cost !== 'number' || cost <= 0) {
      throw new Error('Invalid transaction: cost must be a positive number');
    }

    if (benefitors.some(id => typeof id !== 'number') || paidBy.some(id => typeof id !== 'number')) {
      throw new Error('Invalid transaction: all benefitors and paidBy entries must be numbers');
    }
  }

  const netBalances: Record<number, number> = {}; // Tracks net balances (creditors and debtors)

  // Step 1: Compute net balances per user
  for (const { benefitors, cost, paidBy } of transactions) {
    const sharePerUser = cost / benefitors.length; // Each user owes this much

    // Track how much each paying user contributed
    const individualContributions = cost / paidBy.length;

    for (const payer of paidBy) {
      netBalances[payer] = (netBalances[payer] || 0) + individualContributions;
    }

    for (const benefitor of benefitors) {
      netBalances[benefitor] = (netBalances[benefitor] || 0) - sharePerUser;
    }
  }

  // Step 2: Separate creditors and debtors
  const debtors: { id: number; amount: number }[] = [];
  const creditors: { id: number; amount: number }[] = [];

  for (const [user, balance] of Object.entries(netBalances)) {
    const userId = parseInt(user);
    if (balance < 0) {
      debtors.push({ id: userId, amount: -balance }); // Convert negative to positive for sorting
    } else if (balance > 0) {
      creditors.push({ id: userId, amount: balance });
    }
  }

  // Sort debtors and creditors for efficient settlement
  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => a.amount - b.amount);

  const result: Debt[] = [];

  // Step 3: Pair debtors with creditors optimally
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amountToSettle = Math.min(debtor.amount, creditor.amount);

    result.push({ debtor: debtor.id, creditor: creditor.id, value: amountToSettle });

    // Reduce the remaining debt amounts
    debtor.amount -= amountToSettle;
    creditor.amount -= amountToSettle;

    // Move to the next debtor or creditor if they are settled
    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return result;
}
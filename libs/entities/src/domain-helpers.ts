import { GuiError, PaymentNode } from './index';

/**
 * Groups payment nodes by currency and sums their amounts
 */
export function sumPaymentNodesByCurrency(nodes: PaymentNode[]): Map<string, number> {
  const sums = new Map<string, number>();

  for (const node of nodes) {
    const current = sums.get(node.currency) || 0;
    sums.set(node.currency, current + node.amount);
  }

  return sums;
}

/**
 * Validates that total amount paid equals total amount owed for each currency
 * @throws Error if amounts don't match for any currency
 */
export function validatePaymentAmounts(
  paidBy: PaymentNode[],
  benefitors: PaymentNode[],
): void {
  const paidSums = sumPaymentNodesByCurrency(paidBy);
  const owedSums = sumPaymentNodesByCurrency(benefitors);

  // Check that currencies match
  const allCurrencies = new Set([...paidSums.keys(), ...owedSums.keys()]);

  for (const currency of allCurrencies) {
    const paidAmount = paidSums.get(currency) || 0;
    const owedAmount = owedSums.get(currency) || 0;

    if (paidAmount !== owedAmount) {
      const error
        = new Error(`Amount mismatch for ${currency}: paid ${paidAmount} but owed ${owedAmount}`);
      (error as GuiError).details = {
        paidAmount,
        owedAmount,
        currency,
      };
      throw error;
    }
  }
}
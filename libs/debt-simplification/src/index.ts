import { Debt, RecordData } from '@angular-monorepo/entities';

function orderDebtByAlphabet (
  debt: Debt,
): Debt {
  if (debt.debtor < debt.creditor) {
    return {
      creditor: debt.debtor,
      debtor: debt.creditor,
      value: -debt.value,
    };
  }
  else {
    return {
      creditor: debt.creditor,
      debtor: debt.debtor,
      value: debt.value,
    };
  }
}

function denormalize (
  debt: Debt,
): Debt {
  if (debt.value < 0) {
    return {
      creditor: debt.debtor,
      debtor: debt.creditor,
      value: -debt.value,
    };
  }
  else {
    return {
      creditor: debt.creditor,
      debtor: debt.debtor,
      value: debt.value,
    };
  }
}

function filterDebt (debt: Debt) {
  return debt.value !== 0 && debt.creditor !== debt.debtor;
}

function tidyDebts (
  debts: Debt[],
) {
  const ordered = debts
    .map(d => d)
    .map(orderDebtByAlphabet)
    .sort((a, b) => a.creditor < b.creditor ? -1 : 1);

  const filtered = ordered.filter(filterDebt);
  const summed: { [creditor: number]: { [debtor: number]: number } } = {};
  filtered.forEach(debt => {
    if (!summed[debt.creditor]) {
      summed[debt.creditor] = {};
    }
    if (!summed[debt.creditor][debt.debtor]) {
      summed[debt.creditor][debt.debtor] = 0;
    }
    summed[debt.creditor][debt.debtor] += debt.value;
  });

  const result: Debt[] = [];
  Object.entries(summed).forEach(([creditor, obj]) => {
    Object.entries(obj).forEach(([debtor, value]) => {
      result.push({
        creditor: Number(creditor),
        debtor: Number(debtor),
        value,
      });
    });
  });
  return result.filter(filterDebt);
}

export function constructDebts (
  records: RecordData[],
) {
  const debts: Debt[] = [];
  records.forEach(record => {
    const payers: { [id: number]: number } = {};
    record.paidBy.forEach(payerId => {
      payers[payerId] = record.cost / record.paidBy.length;
    });

    record.benefitors.forEach(benefitor => {
      Object.entries(payers).forEach(([payer, amount]) => {
        debts.push({
          creditor: Number(payer),
          debtor: benefitor,
          value: amount / record.benefitors.length,
        });
      });
    });
  });

  return debts;
}

function findACycle (
  debts: Debt[],
): LinkElement[] | null {
  for (const debt of debts) {
    const startDebtorChain = [{
      a: debt.creditor,
      b: debt.debtor,
      debt: debt,
    }];
    const startCreditorChain = [{
      a: debt.debtor,
      b: debt.creditor,
      debt: debt,
    }];

    const debtorR = recursion(startDebtorChain, debts.map(d => ({
      debt: d,
      used: d === debt,
    })));

    if (debtorR) return debtorR;

    const creaditorR = recursion(startCreditorChain, debts.map(d => ({
      debt: d,
      used: d === debt,
    })));

    if (creaditorR) return creaditorR;
  }

  return null;
}

function recursion (
  chain: LinkElement[],
  candidates: LinkCandidate[],
): LinkElement[] | null {
  if (
    chain.length > 2
        &&
        chain[chain.length - 1].b
        ===
        chain[0].a
  ) {
    return chain;
  }
  else {
    const nextLinks = forGivenChainFind(
      chain,
      candidates,
    );
    if (!nextLinks) return null;
    else {
      for (const link of nextLinks) {
        const result = recursion(link.chain, link.candidates);
        if (result !== null) {
          return result;
        }
      }
    }

    return null;
  }
}

function forGivenChainFind (
  chain: LinkElement[],
  candidates: LinkCandidate[],
) {
  const nextLinks = findNextLinks(
    chain[chain.length - 1],
    candidates,
    chain,
  );

  return nextLinks;
}

interface LinkCandidate {
    debt: Debt,
    used: boolean,
}

interface LinkElement {
    debt: Debt,
    a: number,
    b: number,
}

function findNextLinks (
  toBeLinked: LinkElement,
  candidates: LinkCandidate[],
  chain: LinkElement[],
) {
  const links = candidates
    .filter(candidate => !candidate.used)
    .filter(candidate => {
      return candidate.debt.creditor === toBeLinked.b
            || candidate.debt.debtor === toBeLinked.b;
    })
    .map(candidate => {
      if (candidate.debt.creditor === toBeLinked.b) {
        return {
          debt: candidate.debt,
          a: candidate.debt.creditor,
          b: candidate.debt.debtor,
        };
      }
      else {
        return {
          debt: candidate.debt,
          a: candidate.debt.debtor,
          b: candidate.debt.creditor,
        };
      }
    });

  if (!links.length) return null;
  else {
    const nextLinks: {
            candidates: LinkCandidate[],
            link: LinkElement,
            chain: LinkElement[],
        }[]
            =  [];

    links.forEach(link => {
      nextLinks.push({
        candidates: candidates.map(candidate => ({
          debt: candidate.debt,
          used: candidate.used || candidate.debt === link.debt,
        })),
        link,
        chain: [
          ...chain.map(ce => ({
            debt: ce.debt,
            a: ce.a,
            b: ce.b,
          })),
          link,
        ],
      });
    });
    return nextLinks;
  }
}

export function settle (records: RecordData[]) {
  const debts = constructDebts(records);

  let tidied: Debt[] = debts;
  let isDone = false;
  while (!isDone) {
    tidied = tidyDebts(tidied);
    const cycle = findACycle(tidied);
    if (cycle) {
      const clearingAmount = (cycle[0].debt.value) * -1;
      cycle.forEach(cm => {
        const direction = cm.a === cm.debt.creditor ? 1 : 0;
        if (direction === 1) {
          cm.debt.value += clearingAmount;
        }
        else {
          cm.debt.value += -clearingAmount;
        }
      });
    } else {
      isDone = true;
    }
  }

  return tidied.map(denormalize)
    .map(item => {
      return item;
    });
}

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

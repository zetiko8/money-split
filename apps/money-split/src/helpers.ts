import { CreatePaymentEventData, PaymentEvent, PaymentEventView, PaymentNodeView } from '@angular-monorepo/entities';
import { Observable, ReplaySubject, combineLatest, map } from 'rxjs';
import { PaymentEventSimple } from './app/types';

export function combineLoaders (
  loaders: Observable<boolean>[],
): Observable<boolean> {
  return combineLatest(loaders).pipe(map(all => all.some(l => l)));
}

export class ImprovedProcess <Argument, ReturnType> {
  private mmResourceLoadingCache: number[] = [];
  private loadFn: (data: Argument) => Observable<ReturnType>;
  public inProgress$ = new ReplaySubject<boolean>(1);
  public error$ = new ReplaySubject<Error | null>(1);
  public data$ = new ReplaySubject<ReturnType>(1);
  public load = (
    data: Argument,
  ) => {
    this.mmResourceLoadingCache.push(0);
    this.inProgress$.next(!!(this.mmResourceLoadingCache.length));
    this.loadFn(data)
      .subscribe({
        next: value => {
          this.mmResourceLoadingCache.pop();
          this.inProgress$.next(!!(this.mmResourceLoadingCache.length));
          this.error$.next(null);
          this.data$.next(value);
        },
        error: e => {
          this.mmResourceLoadingCache.pop();
          this.inProgress$.next(!!(this.mmResourceLoadingCache.length));
          this.error$.next(e);
        },
      });
  };

  constructor (
    loadFn: (data: Argument) => Observable<ReturnType>,
  ) {
    this.loadFn = loadFn;
  }

}

export function getRandomColor () {
  return '#000000'.replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
}

function getUniqueCurrencies (
  paymentEventView: PaymentEventView,
) {
  // caclulate number ofall different currencies in paidBy and benefitors
  const paidByCurrencies = paymentEventView.paidBy.map(item => item.currency);
  const benefitorsCurrencies = paymentEventView.benefitors.map(item => item.currency);
  const allCurrencies = [...paidByCurrencies, ...benefitorsCurrencies];
  const uniqueCurrencies = [...new Set(allCurrencies)];
  return uniqueCurrencies;
}

/**
 * Separate paidBy and benefitors by currency
 * @returns PaymentEventView but only containing one currency
 */
function separateByCurrency (
  paymentEventView: PaymentEventView,
): PaymentEventSimple[] {
  const paidBy = paymentEventView.paidBy.reduce((acc, item) => {
    if (acc[item.currency]) {
      acc[item.currency].push(item);
    } else {
      acc[item.currency] = [item];
    }
    return acc;
  }, {} as { [key: string]: PaymentNodeView[] });
  const benefitors = paymentEventView.benefitors.reduce((acc, item) => {
    if (acc[item.currency]) {
      acc[item.currency].push(item);
    } else {
      acc[item.currency] = [item];
    }
    return acc;
  }, {} as { [key: string]: PaymentNodeView[] });

  // PaymentEventView but only containing one currency
  const separatedPaymentEventView = getUniqueCurrencies(paymentEventView).map(currency => {
    // sum the cost of paidBy
    const paidByCost = paidBy[currency].reduce((acc, item) => acc + item.amount, 0);

    const simple: PaymentEventSimple = {
      id: paymentEventView.id,
      data: {
        benefitors: benefitors[currency].map(item => item.user),
        cost: paidByCost,
        currency,
        paidBy: paidBy[currency].map(item => item.user),
      },
    };
    return simple;
  });

  return separatedPaymentEventView;
}

/**
 * Returns true if every paidBy and every benefitor has same cost and currency
 */
function isSimple (
  paymentEventView: PaymentEventView | PaymentEvent | CreatePaymentEventData,
): boolean {
  const cost: number | null = paymentEventView.paidBy[0]?.amount || null;
  let allCostsAreTheSame = true;
  const paidBy = paymentEventView.paidBy.reduce((acc, item) => {
    if (acc[item.currency]) {
      acc[item.currency].push(item);
    } else {
      acc[item.currency] = [item];
    }
    if (cost !== item.amount) {
      allCostsAreTheSame = false;
    }
    return acc;
  }, {} as { [key: string]: { amount: number, currency: string }[] });
  const debt: number | null = paymentEventView.benefitors[0]?.amount || null;
  let allDebtsAreTheSame = true;
  const benefitors = paymentEventView.benefitors.reduce((acc, item) => {
    if (acc[item.currency]) {
      acc[item.currency].push(item);
    } else {
      acc[item.currency] = [item];
    }
    if (debt !== item.amount) {
      allDebtsAreTheSame = false;
    }
    return acc;
  }, {} as { [key: string]: { amount: number, currency: string }[] });


  return Object.keys(paidBy).length === 1
    && Object.keys(benefitors).length === 1
    && allCostsAreTheSame
    && allDebtsAreTheSame;
}

/**
 * Returns cost and currency of simple payment event
 */
function getSimplePaymentEventCostAndCurrency (
  paymentEventView: PaymentEventView | PaymentEvent,
): { cost: number, currency: string } {
  if (!isSimple(paymentEventView)) {
    throw new Error('Payment event is not simple');
  }
  const costForOne = paymentEventView.paidBy[0].amount;
  if (costForOne === null) {
    throw new Error('Payment event is not simple');
  }
  const currency = paymentEventView.paidBy[0].currency;
  if (currency === null) {
    throw new Error('Payment event is not simple');
  }
  return {
    cost: paymentEventView.paidBy.length * costForOne,
    currency,
  };
}

/**
 * Returns first cost and currency of complex payment event
 */
function getComplexPaymentEventCostAndCurrencyForSimpleConversion (
  createPaymentEventData: CreatePaymentEventData,
): { cost: number, currency: string } {
  const costForOne = createPaymentEventData.paidBy[0]?.amount || 0;
  const currency = createPaymentEventData.paidBy[0]?.currency || 'EUR';

  return {
    cost: (createPaymentEventData.paidBy.length || 0) * costForOne,
    currency,
  };
}

export const PaymentEventViewHelpers = {
  separateByCurrency,
  getUniqueCurrencies,
  isSimple,
  getSimplePaymentEventCostAndCurrency,
  getComplexPaymentEventCostAndCurrencyForSimpleConversion,
};



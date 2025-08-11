import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PaymentEventView, PaymentNodeView, RecordDataView } from '@angular-monorepo/entities';
import { AvatarComponent } from '../../../../components/avatar.component';

interface PaymentEventSimple {
  id: number,
  data: RecordDataView,
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AvatarComponent,
  ],
  selector: 'payment-event-item',
  templateUrl: './payment-event-item.component.html',
})
export class PaymentEventItemComponent {

  public _paymentEventView: PaymentEventView | null = null;
  public paymentEventSimpleViews: PaymentEventSimple[] = [];

  @Input()
  set paymentEventView (value: PaymentEventView) {
    this.paymentEventSimpleViews = separateByCurrency(value);
    this._paymentEventView = value;
  }
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




import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PaymentEventView, SettlementListView } from '@angular-monorepo/entities';
import moment from 'moment';
import { PaymentEventItemComponent } from '../payment-event-item/payment-event-item.component';

interface DateItem {
  date: Date,
  contents: ({
    isRecord: true,
    data: PaymentEventView,
  } | {
    isRecord: false,
    data: SettlementListView,
  })[],
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PaymentEventItemComponent,
  ],
  selector: 'payment-event-list',
  templateUrl: './payment-event-list.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'app-section',
  },
})
export class PaymentEventListComponent {
  @Input()
  set paymentEvents (data: {
    paymentEvents: PaymentEventView[],
  }) {
    const items: DateItem[] = [];
    data.paymentEvents.forEach((paymentEventView) => {
      if (paymentEventView.settlementId === null) {
        getDateItem(paymentEventView.created, items)
          .contents.push({
            data: paymentEventView,
            isRecord: true,
          });
      }
    });

    // data.settlements.forEach((settlementView) => {
    //   getDateItem(settlementView.settlement.created, items)
    //     .contents.push({
    //       data: settlementView,
    //       isRecord: false,
    //     });
    // });

    this._items
      = items.filter(item => !!(item.contents.length));
    console.log(this._items);
  };

  @Output() selectPaymentEvent = new EventEmitter<PaymentEventView>();
  @Output() markAsSettled = new EventEmitter<number>();
  @Output() markAsUnSettled = new EventEmitter<number>();
  public _items: DateItem[] = [];
}

function dateAlreadyExist (
  date: Date,
  items: DateItem[],
) {
  return items.find(
    item => {
      return (
        moment(date).isSame(item.date, 'date')
        &&
        moment(date).isSame(item.date, 'month')
        &&
        moment(date).isSame(item.date, 'year')
      );
    },
  );
}

function getDateItem (
  date: Date,
  items: DateItem[],
): DateItem {
  const item = dateAlreadyExist(date, items);
  if (
    item === undefined
  ) {
    const newItem = {
      date,
      contents: [],
    };
    items.push(newItem);

    return newItem;
  } else {
    return item;
  }
}
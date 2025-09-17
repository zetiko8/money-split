import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PaymentEventView } from '@angular-monorepo/entities';
import { PaymentEventItemComponent } from '../payment-event-item/payment-event-item.component';
import { DateItemComponent } from '../date-item/date-item.component';
import { FormControl } from '@angular/forms';

interface PaymentEventContent {
  isRecord: true;
  data: PaymentEventView;
  formControl?: FormControl<boolean>;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PaymentEventItemComponent,
    DateItemComponent,
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
  set paymentEvents(data: {
    paymentEvents: PaymentEventView[],
    controls?: { id: number, formControl: FormControl<boolean> }[]
  }) {
    this._items = DateItemComponent.groupByDate<PaymentEventView, PaymentEventContent>(
      data.paymentEvents.filter(pe => pe.settlementId === null),
      (paymentEvent) => {
        const obj: PaymentEventContent = {
          isRecord: true,
          data: paymentEvent,
        };
        if (data.controls) {
          obj.formControl = data.controls.find(c => c.id === paymentEvent.id)?.formControl;
        }
        return obj;
      },

    // data.settlements.forEach((settlementView) => {
    //   getDateItem(settlementView.settlement.created, items)
    //     .contents.push({
    //       data: settlementView,
    //       isRecord: false,
    //     });
    // });
    );
  }

  @Output() selectPaymentEvent = new EventEmitter<PaymentEventView>();
  @Output() markAsSettled = new EventEmitter<number>();
  @Output() markAsUnSettled = new EventEmitter<number>();
  @Output() checkboxesChange
    = new EventEmitter<{ id: number, checked: boolean }[]>();
  public _items: Array<{
    date: Date;
    contents: PaymentEventContent[],
  }> = [];
}
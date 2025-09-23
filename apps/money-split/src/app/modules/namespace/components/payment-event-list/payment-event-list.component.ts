import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PaymentEventView, SettlementListView } from '@angular-monorepo/entities';
import { PaymentEventItemComponent } from '../payment-event-item/payment-event-item.component';
import { DateItemComponent } from '../date-item/date-item.component';
import { FormControl } from '@angular/forms';
import { SettlementItemComponent } from '../settlement-item/settlement-item.component';

interface PaymentEventContent {
  isRecord: boolean;
  data: PaymentEventView | SettlementListView;
  formControl?: FormControl<boolean>;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PaymentEventItemComponent,
    DateItemComponent,
    SettlementItemComponent,
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
    controls?: { id: number, formControl: FormControl<boolean> }[],
    settlements?: SettlementListView[],
  }) {
    const payments = DateItemComponent.groupByDate<PaymentEventView, PaymentEventContent>(
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
      });

    const settlements = DateItemComponent.groupByDate<{
      created: Date,
      view: SettlementListView,
    }, PaymentEventContent>(
      data.settlements?.map(s => ({
        created: s.settlement.created,
        view: s,
      })) ?? [],
      (settlement) => {
        const obj: PaymentEventContent = {
          isRecord: false,
          data: settlement.view,
        };
        return obj;
      });

    this._items = [...payments, ...settlements]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
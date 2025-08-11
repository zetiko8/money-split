import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PaymentEventView } from '@angular-monorepo/entities';
import { AvatarComponent } from '../../../../components/avatar.component';
import { PaymentEventSimple } from '../../../../types';
import { PaymentEventViewHelpers } from '../../../../../helpers';

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
    this.paymentEventSimpleViews = PaymentEventViewHelpers.separateByCurrency(value);
    this._paymentEventView = value;
  }
}


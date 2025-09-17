import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PaymentEventView } from '@angular-monorepo/entities';
import { AvatarComponent } from '../../../../components/avatar.component';
import { PaymentEventSimple } from '../../../../types';
import { PaymentEventViewHelpers } from '../../../../../helpers';
import { CheckboxInputComponent } from '@angular-monorepo/components';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AvatarComponent,
    CheckboxInputComponent,
    ReactiveFormsModule,
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

  @Input() checkboxFormControl: FormControl<boolean> | null = null;
  @Output() edit = new EventEmitter<PaymentEventView>();

  @Input() displayType: 'TITLE'
  | 'MY_BALANCE'
  | 'TITLE_AND_MY_BALANCE'
  | 'BALANCE'
  | 'TITLE_AND_BALANCE' = 'TITLE';
}


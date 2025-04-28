import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentNodeFormGroup } from '../../../../types';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  selector: 'amount-form',
  templateUrl: './amount-form.component.html',
})
export class AmountFormComponent {
  @Output() remove = new EventEmitter<PaymentNodeFormGroup>();
  @Input() public form: PaymentNodeFormGroup | null = null;
  @Input() public canRemove = true;

}

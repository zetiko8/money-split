import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormArray } from '@angular/forms';
import { User } from '@angular-monorepo/entities';
import { PaymentNodeFormGroup } from '../../../../types';
import { AmountFormComponent } from '../amount-form/amount-form.component';
import { AvatarComponent } from 'apps/money-split/src/app/components/avatar.component';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    AmountFormComponent,
    AvatarComponent,
  ],
  selector: 'payment-user-form',
  templateUrl: './payment-user-form.component.html',
})
export class PaymentUserFormComponent {
  @Output() add = new EventEmitter<User>();
  @Output() remove = new EventEmitter<PaymentNodeFormGroup>();
  @Input() public form: FormArray<PaymentNodeFormGroup> | null = null;
  @Input() public user: User | null = null;
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateRecordData, NamespaceView, User } from '@angular-monorepo/entities';
import { PaymentEventFormGroup, PaymentNodeFormGroup } from '../../../../types';
import { PaymentUserFormComponent } from '../payment-user-form/payment-user-form.component';

export function getPaymentNodeFormGroup (
  userId: number,
  amount: number,
  currency: string,
): PaymentNodeFormGroup {
  return new FormGroup({
    userId: new FormControl<number>(userId, { nonNullable: true }),
    amount: new FormControl<number>(amount, {
      validators: [
        (control) => {
          if (control.value <= 0) {
            return { required: true };
          }
          else if (control.value === null) {
            return { required: true };
          }
          else if ((Number.isNaN(control.value))) {
            return { required: true };
          }
          else {
            return null;
          }
        },
      ],
      nonNullable: true,
    }),
    currency: new FormControl<string>(currency, {
      validators: [
        (control) => {
          if (control.value === '') {
            return { required: true };
          }
          else if (control.value === null) {
            return { required: true };
          }
          else {
            return null;
          }
        },
      ],
      nonNullable: true,
    }),
  });
}

export function getPaymentEventForm (
  createdBy: number,
  users: User[],
  currencies: string[],
): PaymentEventFormGroup {
  return new FormGroup({
    paidBy: new FormArray<PaymentNodeFormGroup>(
      users.map(user => {
        return getPaymentNodeFormGroup(user.id, 0, currencies[0]);
      }),
    ),
    benefitors: new FormArray<PaymentNodeFormGroup>(
      users.map(user => {
        return getPaymentNodeFormGroup(user.id, 0, currencies[0]);
      }),
    ),
    createdBy: new FormControl<number>(
      createdBy,
      {
        validators: [ Validators.required ],
        nonNullable: true,
      },
    ),
  });
}

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    PaymentUserFormComponent,
  ],
  selector: 'payment-event-form',
  templateUrl: './payment-event-form.component.html',
})
export class PaymentEventFormComponent {

  @Input() submitButtonText = '';
  @Input()
  set formData (data: {
    form: PaymentEventFormGroup,
    namespace: NamespaceView,
  } | null) {
    if (data !== null) {
      this.form = data.form;
      this.usersOptions = data.namespace.users;
      this.ownerUsersOptions = data.namespace.ownerUsers;
    }
  }


  @Output() formSubmit = new EventEmitter<CreateRecordData>();
  public form: PaymentEventFormGroup | null = null;
  public usersOptions: User[] = [];
  public ownerUsersOptions: User[] = [];

  public submit () {
    if (this.form) {
      this.formSubmit.emit(
        this.form.value as CreateRecordData,
      );
    }
  }
}

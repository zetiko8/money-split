import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreatePaymentEventData, NamespaceView, PaymentEvent, PaymentNode, User } from '@angular-monorepo/entities';
import { PaymentEventFormGroup, PaymentNodeFormGroup } from '../../../../../types';
import { PaymentUserFormComponent } from './payment-user-form/payment-user-form.component';
import { DescriptionAndNotesFormComponent } from '../description-and-notes-form/description-and-notes-form.component';
import { FullScreenLoaderComponent } from '../../../../../components/full-screen-loader/full-screen-loader.component';
import { PaymentEventViewHelpers } from '../../../../../../helpers';
import { ModalComponent } from '@angular-monorepo/components';
import { NotesOpenComponent } from '../notes-open-component';

export interface PaymentEventComplexFormData {
  form: PaymentEventFormGroup,
  namespace: NamespaceView,
};

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
  data?: PaymentEvent,
): PaymentEventFormGroup {
  return new FormGroup({
    paidBy: new FormArray<PaymentNodeFormGroup>(
      data ? data.paidBy.map(item => {
        return getPaymentNodeFormGroup(item.userId, item.amount, item.currency);
      }) : [],
    ),
    benefitors: new FormArray<PaymentNodeFormGroup>(
      data ? data.benefitors.map(item => {
        return getPaymentNodeFormGroup(item.userId, item.amount, item.currency);
      }) : [],
    ),
    createdBy: new FormControl<number>(
      createdBy,
      {
        validators: [ Validators.required ],
        nonNullable: true,
      },
    ),
    description: new FormControl<string>(
      data?.description || '',
    ),
    notes: new FormControl<string>(
      data?.notes || '',
    ),
  }, {
    validators: [
      (control) => {
        if (control.value.paidBy.length === 0) {
          return { required: true };
        }
        else if (control.value.benefitors.length === 0) {
          return { required: true };
        }
        else {
          return null;
        }
      },
    ],
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
    DescriptionAndNotesFormComponent,
    FullScreenLoaderComponent,
    ModalComponent,
    NotesOpenComponent,
  ],
  selector: 'payment-event-complex-form',
  templateUrl: './payment-event-complex-form.component.html',
})
export class PaymentEventComplexFormComponent {

  @Input() submitButtonText = '';
  @Input()
  set formData (data: PaymentEventComplexFormData | null) {
    if (data !== null) {
      this.form = data.form;
      this.usersOptions = data.namespace.users;
      this.ownerUsersOptions = data.namespace.ownerUsers;
    }
  }

  @Output() formSubmit = new EventEmitter<CreatePaymentEventData>();
  public form: PaymentEventFormGroup | null = null;
  public usersOptions: User[] = [];
  public ownerUsersOptions: User[] = [];
  @Output() complexModeChange = new EventEmitter<CreatePaymentEventData>();
  public notesOpen = false;
  public isLoading = false;
  public complexModeChangeModalOpen = false;

  public submit () {
    const createPaymentEventData = this.getPaymentEventData();
    if (createPaymentEventData) {
      this.formSubmit.emit(
        createPaymentEventData,
      );
    }
  }

  addUserPayment (user: User) {
    if (this.form) {
      this.form.controls.paidBy.push(
        getPaymentNodeFormGroup(user.id, 0, 'EUR'),
      );
    }
  }

  addUserBenefit (user: User) {
    if (this.form) {
      this.form.controls.benefitors.push(
        getPaymentNodeFormGroup(user.id, 0, 'EUR'),
      );
    }
  }

  removeUserPayment (payment: PaymentNodeFormGroup) {
    if (this.form) {
      this.form.controls.paidBy.removeAt(this.form.controls.paidBy.controls.indexOf(payment));
    }
  }

  removeUserBenefit (payment: PaymentNodeFormGroup) {
    if (this.form) {
      this.form.controls.benefitors.removeAt(this.form.controls.benefitors.controls.indexOf(payment));
    }
  }

  private getPaymentEventData () {
    if (this.form) {
      const createPaymentEventData: CreatePaymentEventData = {
        paidBy: this.form.controls.paidBy.value as PaymentNode[],
        benefitors: this.form.controls.benefitors.value as PaymentNode[],
        description: this.form.controls.description.value,
        notes: this.form.controls.notes.value,
        createdBy: this.form.controls.createdBy.value,
      };
      return createPaymentEventData;
    }
    return null;
  }

  public onComplexModeChange () {

    const createPaymentEventData = this.getPaymentEventData();
    if (createPaymentEventData) {
      if (PaymentEventViewHelpers.isSimple(createPaymentEventData)) {
        this.isLoading = true;
        // allow animation to run
        setTimeout(() => {
          if (this.form) {
            this.complexModeChange.emit(createPaymentEventData);
          }
        }, 200);
      } else {
        this.complexModeChangeModalOpen = true;
      }
    }
  }

  public confirmComplexModeChange () {
    const createPaymentEventData = this.getPaymentEventData();
    if (createPaymentEventData) {
      this.isLoading = true;
      // allow animation to run
      setTimeout(() => {
        if (this.form) {
          this.complexModeChange.emit(createPaymentEventData);
        }
      }, 200);
    }
  }
}

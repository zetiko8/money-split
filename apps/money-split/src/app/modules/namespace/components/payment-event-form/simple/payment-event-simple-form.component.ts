import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CreateRecordData, NamespaceView } from '@angular-monorepo/entities';
import { PaymentEventSimpleFormGroup } from '../../../../../types';
import { CheckboxGroupComponent, CheckboxRadioGroupComponent, SlideSwitcherComponent } from '@angular-monorepo/components';
import { RoutingService } from '../../../../../services/routing/routing.service';
import { AvatarComponent } from '../../../../../components/avatar.component';

export interface PaymentEventSimpleFormData {
  form: PaymentEventSimpleFormGroup,
  namespace: NamespaceView,
}

export function getRecordForm (
  data?: Partial<CreateRecordData>,
): PaymentEventSimpleFormGroup {
  return new FormGroup({
    currency: new FormControl<string>(
      data?.currency || 'EUR',
      {
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
      },
    ),
    cost: new FormControl<number>(data?.cost || 0, {
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
    benefitors: new FormControl<number[]>(
      data?.benefitors || [],
      {
        validators: [
          (control) => {
            if (control.value  && control.value.length === 0) {
              return { required: true };
            } else {
              return null;
            }
          },
        ],
        nonNullable: true,
      },
    ),
    paidBy: new FormControl<number[]>(
      data?.paidBy || [],
      {
        validators: [
          (control) => {
            if (control.value  && control.value.length === 0) {
              return { required: true };
            } else {
              return null;
            }
          },
        ],
        nonNullable: true,
      },
    ),
    createdBy: new FormControl<number | null>(
      data?.createdBy || null,
      {
        validators: [
          (control) => {
            if (!control.value) {
              return { required: true };
            } else {
              return null;
            }
          },
        ],
      },
    ),
    description: new FormControl<string | null>(
      data?.description || null,
      {
      },
    ),
    notes: new FormControl<string | null>(
      data?.notes || null,
      {
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
    CheckboxGroupComponent,
    CheckboxRadioGroupComponent,
    AvatarComponent,
    SlideSwitcherComponent,
  ],
  selector: 'payment-event-simple-form',
  templateUrl: './payment-event-simple-form.component.html',
})
export class PaymentEventSimpleFormComponent {

  public readonly routingService = inject(RoutingService);
  public complexFormControl = new FormControl<boolean>(false);

  @Input() submitButtonText = '';
  @Input()
  set formData (data: PaymentEventSimpleFormData | null) {
    if (data !== null) {
      this.form = data.form;
      this.usersOptions = data.namespace.users
        .map(user => ({
          value: user.id,
          label: user.name,
          data: {
            avatarId: user.avatarId,
            name: user.name,
          },
        }));
      this.ownerUsersOptions = data.namespace.ownerUsers
        .map(user => ({ value: user.id, label: user.name }));
    }
  }


  @Output() complexModeChange = new EventEmitter<boolean>();
  @Output() formSubmit = new EventEmitter<CreateRecordData>();
  public form: PaymentEventSimpleFormGroup | null = null;
  public usersOptions: {
    label: string,
    value: number,
    data: {
      avatarId: number,
      name: string
    } }[] = [];
  public ownerUsersOptions: { label: string, value: number }[] = [];
  public notesOpen = false;

  public submit () {
    if (this.form) {
      this.formSubmit.emit(
        this.form.value as CreateRecordData,
      );
    }
  }
}

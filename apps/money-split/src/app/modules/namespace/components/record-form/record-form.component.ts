import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CreateRecordData, NamespaceView } from '@angular-monorepo/entities';
import { RecordFormGroup } from '../../../../types';
import { CheckboxGroupComponent, CheckboxRadioGroupComponent } from '@angular-monorepo/components';

export function getRecordForm (
  data?: Partial<CreateRecordData>,
): RecordFormGroup {
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
  ],
  selector: 'record-form',
  templateUrl: './record-form.component.html',
})
export class RecordFormComponent {

  @Input() submitButtonText = '';
  @Input()
  set formData (data: {
    form: RecordFormGroup,
    namespace: NamespaceView,
  } | null) {
    if (data !== null) {
      this.form = data.form;
      this.usersOptions = data.namespace.users
        .map(user => ({ value: user.id, label: user.name }));
      this.ownerUsersOptions = data.namespace.ownerUsers
        .map(user => ({ value: user.id, label: user.name }));
    }
  }


  @Output() formSubmit = new EventEmitter<CreateRecordData>();
  public form: RecordFormGroup | null = null;
  public usersOptions: { label: string, value: number }[] = [];
  public ownerUsersOptions: { label: string, value: number }[] = [];

  public submit () {
    if (this.form) {
      this.formSubmit.emit(
        this.form.value as CreateRecordData,
      );
    }
  }
}

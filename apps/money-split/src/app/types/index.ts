import { RecordDataView } from '@angular-monorepo/entities';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

export * from './config.types';
export * from './app.error.types';
export * from './type.helpers';

export type PaymentEventSimpleFormGroup = FormGroup<{
    currency: FormControl<string>;
    cost: FormControl<number>;
    benefitors: FormControl<number[]>;
    paidBy: FormControl<number[]>;
    createdBy: FormControl<number | null>;
    description: FormControl<string | null>;
    notes: FormControl<string | null>;
}>

export type PaymentEventFormGroup = FormGroup<{
    paidBy: FormArray<PaymentNodeFormGroup>;
    benefitors: FormArray<PaymentNodeFormGroup>;
    createdBy: FormControl<number>;
    description: FormControl<string | null>;
    notes: FormControl<string | null>;
}>

export type PaymentNodeFormGroup = FormGroup<{
    userId: FormControl<number>;
    amount: FormControl<number>;
    currency: FormControl<string>;
}>

export interface PaymentEventSimple {
  id: number,
  data: RecordDataView,
}

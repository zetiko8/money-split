import { FormControl, FormGroup } from '@angular/forms';

export * from './config.types';
export * from './app.error.types';
export * from './type.helpers';

export type RecordFormGroup = FormGroup<{
    currency: FormControl<string>;
    cost: FormControl<number>;
    benefitors: FormControl<number[]>;
    paidBy: FormControl<number[]>;
    createdBy: FormControl<number | null>;
}>

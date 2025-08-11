import { randomHtmlName } from '@angular-monorepo/utils';
import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, TemplateRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ],
  selector: 'checkbox-input',
  templateUrl: './checkbox-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxInputComponent),
      multi: true,
    },
  ],
  styles: [ ':host { display: block }' ],
})
export class CheckboxInputComponent
implements ControlValueAccessor {

  @Input() name = randomHtmlName();
  @Input() label = '';
  @Input() required = false;
  @Input() readonly = false;
  @Input() overrideStyles = false;
  @Input() error: string | null = null;
  @Input() customTemplate?: TemplateRef<{ $implicit: string, data: unknown }>;
  @Input() customData?: unknown;

  _disabled = false;
  _value: boolean | null = null;

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  propagateChange = (_: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  propagateTouched = () => {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeValue(obj: any): void {
    if (
      !(obj === true)
      &&
      !(obj === false)
    ) {
      this._value = null;
    }
    else {
      this._value = obj;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  handleChange ($event: boolean) {
    this.propagateChange($event);
  }

  onBlur () {
    this.propagateTouched();
  }

  change ($event: boolean) {
    this._value = $event;
    this.handleChange($event);
  }

}

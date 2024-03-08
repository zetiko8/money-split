import { randomHtmlName } from '@angular-monorepo/utils';
import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
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
  selector: 'date-input',
  templateUrl: './date-input.component.html',
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true,
    },
  ],
})
export class DateInputComponent 
implements ControlValueAccessor {

  @Input() name = randomHtmlName();
  @Input() label = '';
  @Input() required = false;
  @Input() readonly = false;
  @Input() overrideStyles = false;
  @Input() error: string | null = null;
  
  _disabled = false;
  _value: Date | null = null;
  _stringValue = '';

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  propagateChange = (_: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  propagateTouched = () => {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeValue(obj: any): void {
    if (
      !(obj instanceof Date)
    ) {
      this._value = null;
      this._stringValue = '';
    }
    else {
      if (obj === null) {
        this._value = null
        this._stringValue = '';
      }
      else {
        this._value = new Date(obj);
        this._stringValue = dateToStringValue(obj);
      }
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

  handleChange ($event: string) {
    if (
      $event === null
      || $event === ''  
    ) {
      this._value = null;
    } 
    else {
      this._value = new Date($event);
    }
    
    this.propagateChange(this._value);
  }

  onBlur () {
    this.propagateTouched();
  }

}

function dateToStringValue (
  dateIsoString: string | Date,
) {
  if (!dateIsoString) return '';
  const date = new Date(dateIsoString);
  return date.getFullYear()
    + '-'
    + padWithZero(date.getMonth() + 1) 
    + '-' 
    + padWithZero(date.getDate())
    ;
}

function padWithZero (input: unknown) {
  const inp = String(input);

  if (inp.length === 1) return '0' + inp;
  else return inp;
}

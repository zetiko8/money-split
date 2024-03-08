import { randomHtmlName } from '@angular-monorepo/utils';
import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { 
  ControlValueAccessor, 
  FormsModule, 
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { CheckboxInputComponent } from '../checkbox-input/checkbox-input.component';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    CheckboxInputComponent,
  ],
  selector: 'checkbox-radio-group',
  templateUrl: './checkbox-radio-group.component.html',
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxRadioGroupComponent),
      multi: true,
    },
  ],
  styles: [ ':host { display: block }' ],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'input-group' },
})
export class CheckboxRadioGroupComponent 
implements ControlValueAccessor {

  @Input() boxes = true;
  @Input() name = randomHtmlName();
  @Input() label = '';
  @Input() required = false;
  @Input() readonly = false;
  @Input() overrideStyles = false;
  @Input() error: string | null = null;
  @Input()
  set options (value: { 
    value: string | number, 
    label: string 
  }[]) {
    this._options = value.map(option => {
      return {
        bool: this._value === option.value,
        label: option.label,
        value: option.value
      }
    });
  }
  
  _disabled = false;
  _value: string | number | null = null;
  _options: { 
    value: string | number, 
    label: string,
    bool: boolean,
  }[] = []; 

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  propagateChange = (_: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  propagateTouched = () => {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeValue(obj: any): void {
    if (
      (obj === null)
      ||
      (
        !(typeof obj === 'string')
        &&
        !(typeof obj === 'number')
      )
    ) {
      this._value = null;
    }
    else {
      this._value = obj;
    }

    this._options = this._options.map(option => {
      return {
        bool: this._value === option.value,
        label: option.label,
        value: option.value
      }
    });
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

  handleChange (optionKey: string | number) {
    // TODO
  }

  onBlur () {
    this.propagateTouched();
  }
}

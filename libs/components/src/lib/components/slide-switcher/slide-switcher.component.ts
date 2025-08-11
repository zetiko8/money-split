import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  selector: 'slide-switcher',
  templateUrl: './slide-switcher.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SlideSwitcherComponent),
      multi: true,
    },
  ],
  styleUrls: ['./slide-switcher.component.scss'],
})
export class SlideSwitcherComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() disabled = false;

  _value = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  propagateChange = (_: boolean) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  propagateTouched = () => {};

  writeValue(value: boolean): void {
    this._value = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.propagateTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle(): void {
    if (this.disabled) return;
    this._value = !this._value;
    this.propagateChange(this._value);
    this.propagateTouched();
  }
}

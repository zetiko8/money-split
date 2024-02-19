import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, HostBinding } from '@angular/core';
import { 
  ControlValueAccessor, 
  FormsModule, 
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { randomHtmlName } from '@angular-monorepo/utils';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ],
  selector: 'file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['file-input.component.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true,
    },
  ],
})
export class FileInputComponent 
implements ControlValueAccessor {

  @HostBinding('class.ms-form-control') efc = true;

  @Input() name = randomHtmlName();
  @Input() label = '';
  @Input() required = false;
  @Input() readonly = false;
  // @Output() blur = new EventEmitter<void>();
  
  _disabled = false;
  _value = '';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  propagateChange = (_: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  propagateTouched = () => {};

  writeValue(obj: any): void {
    if (
      typeof obj !== 'string'
    ) 
      this._value = '';
    else {
      this._value = obj.toUpperCase();
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  async handleChange ($event: any) {
    if ($event.target?.files?.length) {
        console.log($event.target?.files[0]);
        const fileDataUrl
            = await getBase64($event.target?.files[0]);
        this.propagateChange(fileDataUrl);
    } else {
        this.propagateChange(null);
    }
  }

  onBlur () {
    this.propagateTouched();
  }
}

function getBase64(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          resolve(reader.result as string);
        };
        reader.onerror = function (error) {
          reject(error);
        };
    });
 }
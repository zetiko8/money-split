import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, HostBinding, Output, EventEmitter } from '@angular/core';
import { 
  ControlValueAccessor, 
  FormsModule, 
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { randomHtmlName } from '@angular-monorepo/utils';
import { Observable } from 'rxjs';

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
  @Input() uploadFn: ((fn: File) => Observable<{
    url: string
  }>) | null = null;
  @Output() uploadedFileUrl = new EventEmitter<string>();
  
  _disabled = false;
  _value = '';

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  propagateChange = (_: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  propagateTouched = () => {};

  writeValue(obj: unknown): void {
    if (
      typeof obj !== 'string'
    ) 
      this._value = '';
    else {
      this._value = obj.toUpperCase();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleChange ($event: any) {
    if ($event.target?.files?.length) {
        const fileDataUrl
            = await getBase64($event.target?.files[0]);
        this.propagateChange(fileDataUrl);
        if (this.uploadFn) {
          this.uploadFn($event.target?.files[0])
            .subscribe({
              next: response => {
                this.uploadedFileUrl.emit(response.url);
              },
              error: err => {
                throw err;
              }
            })
        }
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
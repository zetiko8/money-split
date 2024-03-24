import { randomHtmlName } from '@angular-monorepo/utils';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { 
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  selector: 'checkbox-button',
  templateUrl: './checkbox-button.component.html',
  styles: [ ':host { display: block }' ],
})
export class CheckboxButtonComponent {

  @Input() name = randomHtmlName();
  @Input() label = '';
  @Input() readonly = false;
  @Input() overrideStyles = false;
  @Input() error: string | null = null;

  @Output() buttonChange = new EventEmitter<boolean>();
  
  _disabled = false;
  @Input() value: boolean | null = null;

  change ($event: boolean) {
    this.buttonChange.emit($event);
  }

}

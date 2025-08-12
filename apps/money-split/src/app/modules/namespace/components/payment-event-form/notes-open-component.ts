import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'notes-open-component',
  template: `
<form
    (submit)="$event.preventDefault(); closeNotes.emit()"
    *ngIf="descriptionFormControl && notesFormControl"
>
    <div>
      <div class="input-group">
        <input
          [formControl]="descriptionFormControl"
          type="text"
          name="description"
          data-testid="description-input"
          [class.error]="descriptionFormControl.errors"
          placeholder="{{ 'addExpenseDescription' | translate }}"
        >
      </div>
      <div class="input-group">
        <textarea
          [formControl]="notesFormControl"
          type="text"
          name="notes"
          data-testid="notes-input"
          [class.error]="notesFormControl.errors"
          placeholder="{{ 'addExpenseNotes' | translate }}"
          style="height: 60vh;"
        ></textarea>
      </div>
    </div>
    <div class="input-group">
        <button
            type="submit"
            data-test="add-description-notes-confirm-btn"
        >
        {{ 'confirm' | translate }}
        </button>
    </div>
</form>
  `,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
})
export class NotesOpenComponent {
  @Output() closeNotes = new EventEmitter<void>();
  @Input() public descriptionFormControl: FormControl<string | null> | null = null;
  @Input() public notesFormControl: FormControl<string | null> | null = null;
}
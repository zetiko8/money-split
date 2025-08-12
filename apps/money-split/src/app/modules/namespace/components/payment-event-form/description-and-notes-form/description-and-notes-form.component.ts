import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { SlideSwitcherComponent } from '@angular-monorepo/components';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    SlideSwitcherComponent,
  ],
  selector: 'description-and-notes-form',
  templateUrl: './description-and-notes-form.component.html',
})
export class DescriptionAndNotesFormComponent {
  @Output() complexModeChange = new EventEmitter<void>();
  @Output() openNotes = new EventEmitter<void>();
  @Input() public descriptionFormControl: FormControl<string | null> | null = null;
  @Input() public notesFormControl: FormControl<string | null> | null = null;
  @Input()
  set sliderState(value: boolean) {
    this.complexFormControl.setValue(value);
  }

  public complexFormControl = new FormControl<boolean>(false);
}

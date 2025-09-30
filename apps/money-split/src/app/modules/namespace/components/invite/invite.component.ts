import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppErrorCode } from '../../../../types';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  selector: 'invite',
  templateUrl: './invite.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'app-section',
  },
})
export class InviteOwnerComponent {

  @Input() isLoading: boolean = false;
  @Output() invite = new EventEmitter<{ email: string }>();

  public form = new FormGroup({
    email: new FormControl<string | null>('', {
      validators: [
        Validators.required,
        Validators.email,
      ],
    }),
  });

  inviteUser () {
    if (!this.form.valid)
      throw new Error(AppErrorCode.FormValidation);

    this.invite.emit({ email: this.form.value.email as string });
    this.form.reset();
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CustomizeAvatarComponent } from '../customize-avatar/customize-avatar.component';
import { CreateNamespacePayload, MNamespaceSettings } from '@angular-monorepo/entities';
import { getRandomColor } from '@angular-monorepo/utils';

export const createNamespaceSettingsForm = (
  namespaceSettings?: MNamespaceSettings,
) => {
  return new FormGroup({
    namespaceName: new FormControl<string>(
      namespaceSettings?.namespaceName || '', { validators: [ Validators.required ] }),
    avatarColor: new FormControl<string>(
      namespaceSettings?.avatarColor || getRandomColor()),
    avatarImage: new FormControl<string | null>(
      null),
    avatarUrl: new FormControl<string | null>(
      namespaceSettings?.avatarUrl || null),
  });
};

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CustomizeAvatarComponent,
  ],
  selector: 'namespace-settings-form',
  templateUrl: './namespace-settings.form.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class NamespaceSettingsFormComponent {
  @Input() form = createNamespaceSettingsForm();

  @Output() submited = new EventEmitter<CreateNamespacePayload>();

  public submit () {
    this.submited.emit(this.form.value as CreateNamespacePayload);
  }
}

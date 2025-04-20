import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CustomizeAvatarComponent } from '../customize-avatar/customize-avatar.component';
import { CreateNamespacePayload, MNamespaceSettings } from '@angular-monorepo/entities';
import { getRandomColor } from '@angular-monorepo/utils';

export type NamespaceSettingsFormType = FormGroup<{
  namespaceName: FormControl<string | null>;
  avatarColor: FormControl<string | null>;
  avatarImage: FormControl<string | null>;
  avatarUrl: FormControl<string | null>;
}>;

export const createNamespaceSettingsForm = (
  namespaceSettings?: MNamespaceSettings,
): NamespaceSettingsFormType => {
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
  _form: NamespaceSettingsFormType = createNamespaceSettingsForm();
  private _originalForm: NamespaceSettingsFormType = createNamespaceSettingsForm();
  @Input()
  set form (form: NamespaceSettingsFormType) {
    this._form = form;
    this._originalForm = createNamespaceSettingsForm({
      avatarColor: form.value.avatarColor || null,
      avatarUrl: form.value.avatarUrl || null,
      namespaceName: form.value.namespaceName || '',
    });
  }

  @Output() submited = new EventEmitter<CreateNamespacePayload>();

  public submit () {
    this.submited.emit({
      avatarColor: this._form.value.avatarColor,
      avatarUrl: this._form.value.avatarUrl,
      namespaceName: this._form.value.namespaceName,
    } as CreateNamespacePayload);
  }

  public cancel () {
    this._form = createNamespaceSettingsForm({
      avatarColor: this._originalForm.value.avatarColor || null,
      avatarUrl: this._originalForm.value.avatarUrl || null,
      namespaceName: this._originalForm.value.namespaceName || '',
    });
  }
}

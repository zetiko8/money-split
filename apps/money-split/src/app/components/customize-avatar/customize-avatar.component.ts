import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FileInputComponent } from '@angular-monorepo/components';
import { AvatarComponent } from '../avatar.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    AvatarComponent,
    FileInputComponent,
  ],
  selector: 'customize-avatar',
  templateUrl: './customize-avatar.component.html',
})
export class CustomizeAvatarComponent {
  @Input() avatarColor!: FormControl<string | null>;
  @Input() avatarImage!: FormControl<string | null>;
  @Input() avatarName = '';
}

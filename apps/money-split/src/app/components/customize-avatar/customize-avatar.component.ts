import { Component, Input, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FileInputComponent } from '@angular-monorepo/components';
import { AvatarComponent } from '../avatar.component';
import { FileUploadService } from '../../services/file-upload.service';
import { FullScreenLoaderComponent } from '../full-screen-loader/full-screen-loader.component';
import { BoundProcess2 } from 'rombok';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    AvatarComponent,
    FileInputComponent,
    FullScreenLoaderComponent,
  ],
  selector: 'customize-avatar',
  templateUrl: './customize-avatar.component.html',
  providers: [
    FileUploadService,
  ],
})
export class CustomizeAvatarComponent {

  public fileUploadService
    = inject(FileUploadService);
  public readonly fileUploadProcess = new BoundProcess2<
    File,
    { url: string }
  >(
    (file: File) => this.fileUploadService.upload(file),
  );

  @Input() avatarColor!: FormControl<string | null>;
  @Input() avatarImage!: FormControl<string | null>;
  @Input() avatarUrl!: FormControl<string | null>;
  @Input() avatarName = '';
}

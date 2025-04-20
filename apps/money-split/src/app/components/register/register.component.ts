import { Component, Input, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AsyncProcess } from 'rombok';
import { Observable, filter, map, merge } from 'rxjs';
import { RegisterOwnerPayload } from '@angular-monorepo/entities';
import { PageComponent } from '../../layout/page/page.component';
import { UserService } from '../../services/auth/token/auth.token.user.service';
import { getRandomColor } from '../../../helpers';
import { Notification } from '../notifications/notifications.types';
import { AppErrorCode } from '../../types';
import { CustomizeAvatarComponent } from '../customize-avatar/customize-avatar.component';
import { CustomValidators } from '@angular-monorepo/components';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    PageComponent,
    CustomizeAvatarComponent,
  ],
  selector: 'register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {

  @Input() onSuccess: () => void
    = () => this.router.navigate(['login']);

  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  public readonly form = new FormGroup({
    password: new FormControl<string>(
      '', { validators: [ Validators.required ] }),
    username: new FormControl<string>(
      '', { validators: [
        Validators.required,
        Validators.maxLength(20),
        CustomValidators.requiredNotEmpty,
      ] }),
    avatarColor: new FormControl<string>(
      getRandomColor()),
    avatarImage: new FormControl<string | null>(
      null),
    avatarUrl: new FormControl<string | null>(
      null),
  });

  public readonly registerProcess = new AsyncProcess(
    (data: RegisterOwnerPayload) => this
      .userService.register(data),
  );

  public readonly notification$: Observable<Notification>
    = merge(this.registerProcess.error$)
      .pipe(
        filter(err => err !== null),
        map(event => {
          return { type: 'error', message: event?.message || 'Error' };
        }),
      );

  public register () {

    if (!this.form.valid) throw Error(AppErrorCode.FormValidation);

    this.registerProcess.execute({
      username: this.form.value.username as string,
      password: this.form.value.password as string,
      avatarColor: this.form.value.avatarColor as string,
      avatarUrl: this.form.value.avatarUrl as string,
    },
    )
      .subscribe(() => {
        this.onSuccess();
      });
  }
}

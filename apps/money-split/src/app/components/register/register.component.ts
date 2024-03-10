import { Component, Input, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { Observable, filter, map, merge } from 'rxjs';
import { RegisterOwnerPayload } from '@angular-monorepo/entities';
import { FileInputComponent } from '@angular-monorepo/components';
import { PageComponent } from '../../layout/page/page.component';
import { AvatarComponent } from '../avatar.component';
import { UserService } from '../../services/auth/token/auth.token.user.service';
import { getRandomColor } from 'apps/money-split/src/helpers';
import { Notification } from '../notifications/notifications.types';
import { AppErrorCode } from '../../types';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    PageComponent,
    AvatarComponent,
    FileInputComponent,
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
      '', { validators: [ Validators.required ] }),
    avatarColor: new FormControl<string>(
      getRandomColor()),
    avatarImage: new FormControl<string | null>(
      null)
  });

  public readonly registerProcess = new BoundProcess(
    (data: RegisterOwnerPayload) => this
      .userService.register(data) 
  )

  public readonly notification$: Observable<Notification> 
    = merge(this.registerProcess.error$) 
    .pipe(
      filter(err => err !== null),
      map(event => {
        console.log(event);
        return { type: 'error', message: event?.message || 'Error' };
      }),  
    );

  public register () {

    if (!this.form.valid) throw Error(AppErrorCode.FormValidation);

    this.registerProcess.execute({
      username: this.form.value.username as string,
      password: this.form.value.password as string,
      avatarColor: this.form.value.avatarColor as string,
      avatarImage: this.form.value.avatarImage as string,
    }
    )
      .subscribe(() => {
        this.onSuccess();
      })
  }
}

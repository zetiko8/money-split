import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { Observable, filter, map, merge } from 'rxjs';
import { PageComponent } from '../page/page.component';
import { AuthService } from '../../services/auth/token/auth.token.service';
import { UserService } from '../../services/auth/token/auth.token.user.service';
import { Notification } from '../notifications/notifications.types';
import { AppErrorCode } from '../../types';
import { LoginService } from './login.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    PageComponent,
  ],
  selector: 'login-component',
  templateUrl: './login.component.html',
})
export class LoginComponent {

  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  public readonly loginService = inject(LoginService);

  public readonly form = new FormGroup({
    password: new FormControl<string>(
      '', { validators: [ Validators.required ] }),
    username: new FormControl<string>(
      '', { validators: [ Validators.required ] }),
  });

  public readonly loginProcess = new BoundProcess(
    (data: { username: string, password: string }) => this
      .authService.login(data) 
  )

  public readonly notification$: Observable<Notification> 
    = merge(this.loginProcess.error$) 
    .pipe(
      filter(err => err !== null),
      map(event => {
        return { type: 'error', message: event?.message || 'Error' };
      }),  
    );

  public login () {

    if (!this.form.valid) throw Error(AppErrorCode.FormValidation);

    this.loginProcess.execute({
      username: this.form.value.username as string,
      password: this.form.value.password as string,
    }
    )
      .subscribe(() => {
        this.userService.loadUserProfile()
          .pipe(
            map(userProfile => {
              return userProfile.key as string;
            })
          ).subscribe(ownerKey => {
            this.loginService.onSuccess(ownerKey);
          })
      });
  }
}

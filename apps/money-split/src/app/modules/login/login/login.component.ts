import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AppErrorCode } from '../../../types';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../layout/page/page.component';
import { Observable, filter, map, merge } from 'rxjs';
import { Notification } from '../../../components/notifications/notifications.types';
import { AuthService } from '../../../services/auth/token/auth.token.service';
import { RoutingService } from '../../../services/routing/routing.service';
import { UserService } from '../../../services/auth/token/auth.token.user.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    PageComponent,
  ],
  selector: 'login-view',
  templateUrl: './login.component.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class LoginView {

  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly routingService = inject(RoutingService);

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
            this.routingService.goToOwnerRealmView(ownerKey);
          })
      });
  }
}

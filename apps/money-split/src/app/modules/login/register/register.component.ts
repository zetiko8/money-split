import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/auth/token/auth.token.user.service';
import { AppErrorCode } from '../../../types';
import { BoundProcess } from 'rombok';
import { PageComponent } from 'apps/money-split/src/components/page/page.component';
import { Observable, filter, map, merge } from 'rxjs';
import { Notification } from 'apps/money-split/src/components/notifications/notifications.types';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    PageComponent,
  ],
  selector: 'register-view',
  templateUrl: './register.component.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class RegisterView {

  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  public readonly form = new FormGroup({
    password: new FormControl<string>(
      '', { validators: [ Validators.required ] }),
    username: new FormControl<string>(
      '', { validators: [ Validators.required ] }),
  });

  public readonly registerProcess = new BoundProcess(
    (data: { username: string, password: string }) => this
      .userService.register(data.username, data.password) 
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
    }
    )
      .subscribe(() => {
        this.router.navigate(['login']);
      })
  }
}

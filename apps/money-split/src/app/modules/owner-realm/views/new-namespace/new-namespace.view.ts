import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AppErrorCode } from '../../../../types';
import { BoundProcess } from 'rombok';
import { PageComponent } from 'apps/money-split/src/components/page/page.component';
import { Observable, filter, map, merge } from 'rxjs';
import { Notification } from 'apps/money-split/src/components/notifications/notifications.types';
import { OwnerRealmService } from '../../services/owner-realm.service';
import { RoutingService } from 'apps/money-split/src/app/services/routing/routing.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    PageComponent,
  ],
  selector: 'new-namespace',
  templateUrl: './new-namespace.view.html',
  providers: [
    OwnerRealmService,
  ]
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class NewNamespaceView {

  private readonly ownerRealmService = inject(OwnerRealmService);
  private readonly routingService = inject(RoutingService);

  public readonly form = new FormGroup({
    namespaceName: new FormControl<string>(
      '', { validators: [ Validators.required ] }),
  });

  public readonly createProcess = new BoundProcess(
    (data: { namespaceName: string }) => this
      .ownerRealmService.createNewNamespace(data) 
  )

  public readonly notification$: Observable<Notification> 
    = merge(this.createProcess.error$) 
    .pipe(
      filter(err => err !== null),
      map(event => {
        return { type: 'error', message: event?.message || 'Error' };
      }),  
    );

  public create () {

    if (!this.form.valid) throw Error(AppErrorCode.FormValidation);

    this.createProcess.execute({
      namespaceName: this.form.value.namespaceName as string,
    }
    )
      .subscribe(namespace => {
        this.routingService.goToNamespaceView(namespace.id);
      })
  }
}

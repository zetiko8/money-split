import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { Observable, filter, map, merge } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { OwnerRealmService } from '../../services/owner-realm.service';
import { RoutingService } from '../../../../services/routing/routing.service';
import { CreateNamespacePayload } from '@angular-monorepo/entities';
import { NamespaceSettingsFormComponent } from '../../../../components/namespace-settings/namespace-settings.form';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    PageComponent,
    NamespaceSettingsFormComponent,
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
  public readonly routingService = inject(RoutingService);

  public readonly createProcess = new BoundProcess(
    (data: CreateNamespacePayload) => this
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

  public create (form: CreateNamespacePayload) {

    this.createProcess.execute(
      form
    )
      .subscribe(namespace => {
        this.routingService.goToNamespaceView(namespace.id);
      });
  }
}

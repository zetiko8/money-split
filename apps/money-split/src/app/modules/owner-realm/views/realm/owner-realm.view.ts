import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { Observable, combineLatest, filter, map, merge } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { OwnerRealmService } from '../../services/owner-realm.service';
import { RoutingService } from '../../../../services/routing/routing.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    PageComponent,
  ],
  selector: 'owner-realm',
  templateUrl: './owner-realm.view.html',
  providers: [
    OwnerRealmService,
  ]
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class OwnerRealmView {

  private readonly ownerRealmService = inject(OwnerRealmService);
  private readonly routingService = inject(RoutingService);

  public readonly loadProcess = new BoundProcess(
    () => this.ownerRealmService.getNamespaces() 
  )

  public readonly namespaces$
    = combineLatest([
      this.loadProcess.execute(),
      this.routingService.getOwnerKey(),
    ])
    .pipe(map(([mNamespaces, ownerKey]) => {
      return mNamespaces.map(ns => ({
        name: ns.name,
        link: this.routingService.namespaceViewLink(ownerKey, ns.id),
      }))
    }));

  public readonly notification$: Observable<Notification> 
    = merge(this.loadProcess.error$) 
    .pipe(
      filter(err => err !== null),
      map(event => {
        return { type: 'error', message: event?.message || 'Error' };
      }),  
    );

  createNewRealm () {
    this.routingService.goToNewNamespaceView();
  }
}

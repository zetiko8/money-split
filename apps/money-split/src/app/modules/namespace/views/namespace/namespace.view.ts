import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { BehaviorSubject, Observable, ReplaySubject, filter, map, merge, mergeMap, of, share, tap } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { RoutingService } from '../../../../services/routing/routing.service';
import { NamespaceService } from '../../services/namespace.service';
import { combineLoaders } from '../../../../../helpers';
import { NamespaceView as MNamespaceView } from '@angular-monorepo/entities';
import { TabsHeaderComponent } from '../../../../components/tabs-header.component';
import { NamespaceRecordsComponent } from '../../components/namespace-records/namespace-records.component';
import { NamespaceMembersComponent } from '../../components/namespace-members/namespace-members.component';
import { NamespaceHeaderComponent } from '../../components/namespace.header.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    PageComponent,
    TabsHeaderComponent,
    NamespaceRecordsComponent,
    NamespaceMembersComponent,
    NamespaceHeaderComponent,
  ],
  selector: 'namespace',
  templateUrl: './namespace.view.html',
  providers: [
    NamespaceService,
  ],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class NamespaceView {

  private readonly nameSpaceService = inject(NamespaceService);
  public readonly routingService = inject(RoutingService);

  public readonly loadProcess = new BoundProcess(
    () => this.nameSpaceService.getNamespace() 
  );

  public readonly namespace$
    = merge(
      of(''),
    ).pipe(
      mergeMap(() => this.loadProcess.execute('')),
      tap(namespace => {
        this.activeTab$.next((
          namespace.records.length === 0 
          && namespace.users.length < 2
        ) ? 'users' : 'recordsList')
      }),
      share({ connector: () => new ReplaySubject<MNamespaceView>() })
    );

  public readonly isLoading = combineLoaders([
    this.loadProcess.inProgress$,
  ]);

  public readonly notification$: Observable<Notification> 
    = merge(
      this.loadProcess.error$,
    ) 
    .pipe(
      filter(err => err !== null),
      map(event => {
        return { type: 'error', message: event?.message || 'Error' };
      }),  
    );

  public activeTab$ = new BehaviorSubject<string>('');
}

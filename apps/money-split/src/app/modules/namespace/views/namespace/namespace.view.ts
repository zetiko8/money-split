import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  map,
  merge,
  mergeMap,
  of,
  take,
  tap,
} from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { RoutingService } from '../../../../services/routing/routing.service';
import { NamespaceService } from '../../services/namespace.service';
import { combineLoaders } from '../../../../../helpers';
import { TabsHeaderComponent } from '../../../../components/tabs-header.component';
import { NamespaceRecordsComponent } from '../../components/namespace-records/namespace-records.component';
import { NamespaceMembersComponent } from '../../components/namespace-members/namespace-members.component';
import { NamespaceHeaderComponent } from '../../components/namespace.header.component';
import { ActivatedRoute } from '@angular/router';

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
  public readonly route = inject(ActivatedRoute);

  private readonly reload$ = new Subject<void>();
  public readonly loadProcess = AsyncProcess.on(
    merge(
      of(''),
      this.reload$,
    ),
    () => this.nameSpaceService.getNamespace(),
  );
  public readonly markAsSettledProcess = new AsyncProcess(
    (settlementDebtId: number) => this
      .namespace$.pipe(take(1))
      .pipe(
        mergeMap(namespace => this.nameSpaceService
          .markAsSettled(settlementDebtId, namespace.ownerUsers[0].id)),
        tap(() => this.reload$.next()),
      ),
  );
  public readonly markAsUnsettledProcess = new AsyncProcess(
    (settlementDebtId: number) => this
      .namespace$.pipe(take(1))
      .pipe(
        mergeMap(namespace => this.nameSpaceService
          .markAsUnSettled(settlementDebtId, namespace.ownerUsers[0].id)),
        tap(() => this.reload$.next()),
      ),
  );

  public readonly namespace$
    = this.loadProcess.share().pipe(
      mergeMap(namespace => this.route.queryParams
        .pipe(
          map(params => ({
            tab: params['tab'],
            namespace,
          })),
        )),
      tap(({ namespace, tab }) => {
        if (tab) {
          this.activeTab$.next(tab);
        } else {
          this.activeTab$.next((
            namespace.paymentEvents.length === 0
            && namespace.users.length < 2
          ) ? this.routingService.NAMESPACE_VIEW_TAB.users
            : this.routingService.NAMESPACE_VIEW_TAB.recordsList);
        }
      }),
      map(({ namespace}) => namespace),
    );

  public readonly isLoading = combineLoaders([
    this.loadProcess.inProgress$,
  ]);

  public readonly notification$: Observable<Notification>
    = merge(
      this.loadProcess.error$,
      this.markAsSettledProcess.error$,
      this.markAsUnsettledProcess.error$,
    )
      .pipe(
        filter(err => err !== null),
        map(event => {
          return { type: 'error', message: event?.message || 'Error' };
        }),
      );

  public activeTab$ = new BehaviorSubject<string>('');
}

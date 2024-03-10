import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { Observable, ReplaySubject, Subject, filter, map, merge, mergeMap, of, share } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { RoutingService } from '../../../../services/routing/routing.service';
import { NamespaceService } from '../../services/namespace.service';
import { combineLoaders } from '../../../../../helpers';
import { UsersListComponent } from '../../components/users-list/users-list.component';
import { RecordsListComponent } from '../../components/records-list/records-list.component';
import { NamespaceView as MNamespaceView } from '@angular-monorepo/entities';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    PageComponent,
    UsersListComponent,
    RecordsListComponent,
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

  public readonly reload$ = new Subject<void>();

  public readonly namespace$
    = merge(
      of(''),
      this.reload$
    ).pipe(
      mergeMap(() => this.loadProcess.execute('')),
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

  addRecord () {
    this.routingService.goToAddExpenseView();
  }
}

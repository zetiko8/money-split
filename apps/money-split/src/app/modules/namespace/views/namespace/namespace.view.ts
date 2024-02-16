import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../../../components/page/page.component';
import { Observable, Subject, filter, map, merge, mergeMap, of, tap } from 'rxjs';
import { Notification } from '../../../../../components/notifications/notifications.types';
import { RoutingService } from '../../../../services/routing/routing.service';
import { NamespaceService } from '../../services/namespace.service';
import { InviteOwnerComponent } from '../../components/invite/invite.component';
import { combineLoaders } from '../../../../../helpers';
import { UsersListComponent } from '../../components/users-list/users-list.component';
import { RecordsListComponent } from '../../components/records-list/records-list.component';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    PageComponent,
    InviteOwnerComponent,
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
  private readonly routingService = inject(RoutingService);

  public readonly loadProcess = new BoundProcess(
    () => this.nameSpaceService.getNamespace() 
  );
  public readonly inviteProcess = new BoundProcess(
    (email: string) => this.nameSpaceService.inviteOwner(email)
      .pipe(
        tap(() => this.reload$.next()),
      ) 
  );

  public readonly reload$ = new Subject<void>();

  public readonly namespace$
    = merge(
      of(''),
      this.reload$
    ).pipe(
      mergeMap(() => this.loadProcess.execute('')),
    );

  public readonly isLoading = combineLoaders([
    this.loadProcess.inProgress$,
    this.inviteProcess.inProgress$,
  ]);

  public readonly notification$: Observable<Notification> 
    = merge(
      this.loadProcess.error$,
      this.inviteProcess.error$,
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

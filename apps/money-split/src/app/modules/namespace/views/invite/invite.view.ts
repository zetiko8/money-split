import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { Observable, filter, map, merge, tap } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { RoutingService } from '../../../../services/routing/routing.service';
import { NamespaceService } from '../../services/namespace.service';
import { InviteOwnerComponent } from '../../components/invite/invite.component';
import { combineLoaders } from '../../../../../helpers';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PageComponent,
    InviteOwnerComponent,
  ],
  selector: 'invite-view',
  templateUrl: './invite.view.html',
  providers: [
    NamespaceService,
  ],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class InviteView {

  private readonly nameSpaceService = inject(NamespaceService);
  public readonly routingService = inject(RoutingService);

  public readonly inviteProcess = new BoundProcess(
    (email: string) => this.nameSpaceService.inviteOwner(email)
      .pipe(
        tap(() => this.routingService.goToNamespaceView()),
      ) 
  );

  public readonly isLoading = combineLoaders([
    this.inviteProcess.inProgress$,
  ]);

  public readonly notification$: Observable<Notification> 
    = merge(
      this.inviteProcess.error$,
    ) 
    .pipe(
      filter(err => err !== null),
      map(event => {
        return { type: 'error', message: event?.message || 'Error' };
      }),  
    );
}

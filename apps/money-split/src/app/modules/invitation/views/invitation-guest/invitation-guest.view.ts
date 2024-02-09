import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from 'apps/money-split/src/components/page/page.component';
import { Observable, filter, map, merge } from 'rxjs';
import { Notification } from 'apps/money-split/src/components/notifications/notifications.types';
import { RoutingService } from 'apps/money-split/src/app/services/routing/routing.service';
import { NamespaceService } from '../../services/invitation.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLoaders } from 'apps/money-split/src/helpers';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    PageComponent,
    ReactiveFormsModule,
  ],
  selector: 'invitation-guest',
  templateUrl: './invitation-guest.view.html',
  providers: [
    NamespaceService,
  ],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class InvitationGuestView {

  private readonly nameSpaceService = inject(NamespaceService);
  private readonly routingService = inject(RoutingService);

  public readonly loadProcess = new BoundProcess(
    () => this.nameSpaceService.getNamespace() 
  )
  public readonly inviteProcess = new BoundProcess(
    (email: string) => this.nameSpaceService.inviteOwner(email) 
  )

  public readonly namespace$
    = this.loadProcess.execute('');

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

  public form = new FormGroup({
    email: new FormControl<string | null>('', {
      validators: [ Validators.required ]
    })
  });
}

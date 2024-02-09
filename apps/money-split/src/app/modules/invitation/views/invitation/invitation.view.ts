import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PageComponent } from '../../../../../components/page/page.component';
import { Observable, filter, map, merge } from 'rxjs';
import { Notification } from '../../../../../components/notifications/notifications.types';
import { RoutingService } from '../../../../services/routing/routing.service';
import { InvitationService } from '../../services/invitation.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImprovedProcess, combineLoaders } from '../../../../../helpers';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    PageComponent,
    ReactiveFormsModule,
  ],
  selector: 'invitation',
  templateUrl: './invitation.view.html',
  providers: [
    InvitationService,
  ],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class InvitationView {

  private readonly invitationService = inject(InvitationService);
  private readonly routingService = inject(RoutingService);

  public readonly loadProcess = new ImprovedProcess(
    () => this.invitationService.getInvitationView() 
  )
  public readonly acceptProcess = new ImprovedProcess(
    (name: string) => this.invitationService.acceptInvitation(name) 
  )
  public readonly rejectProcess = new ImprovedProcess(
    () => this.invitationService.rejectInvitation() 
  )

  public readonly isLoading = combineLoaders([
    this.loadProcess.inProgress$,
    this.acceptProcess.inProgress$,
    this.rejectProcess.inProgress$,
  ]);

  public readonly notification$: Observable<Notification> 
    = merge(
      this.loadProcess.error$,
      this.acceptProcess.error$,
      this.rejectProcess.error$,
    ) 
    .pipe(
      filter(err => err !== null),
      map(event => {
        return { type: 'error', message: event?.message || 'Error' };
      }),  
    );

  public readonly form = new FormGroup({
    name: new FormControl<string>('', Validators.required),
  });

  public accept () {
    this.acceptProcess.load(this.form.value.name as string);
  }

  constructor () {
    this.loadProcess.load('');

    this.acceptProcess.data$
      .subscribe(data => this.routingService.goToNamespaceView(
        data.namespaceId,
      ));
  }
}

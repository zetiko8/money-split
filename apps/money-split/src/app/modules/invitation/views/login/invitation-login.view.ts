import { Component, Injectable, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { LoginComponent } from 'apps/money-split/src/app/components/login/login.component';
import { LoginService } from 'apps/money-split/src/app/components/login/login.service';
import { RoutingService } from 'apps/money-split/src/app/services/routing/routing.service';
import { ImprovedProcess } from 'apps/money-split/src/helpers';
import { InvitationService } from '../../services/invitation.service';
import { PageComponent } from 'apps/money-split/src/app/layout/page/page.component';
import { TranslateModule } from '@ngx-translate/core';

@Injectable()
class InvitationLoginService extends LoginService {

  private readonly routingService = inject(RoutingService);

  public override onSuccess = () => {
    this.routingService.goToInvitationView();
  };
  public override registerLink$
    = this.routingService.getInvitationId()
    .pipe(
      map(
        invitationId => this.routingService
          .invitationRegisterLink(invitationId))
    );
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    PageComponent,
    TranslateModule,
  ],
  selector: 'invitation-login-view',
  templateUrl: './invitation-login.view.html',
  providers: [
    {
      provide: LoginService,
      useClass: InvitationLoginService,
    },
    InvitationService,
  ]
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class InvitationLoginView {
  private readonly invitationService = inject(InvitationService);

  public readonly loadProcess = new ImprovedProcess(
    () => this.invitationService.getInvitationView() 
  );

  constructor () {
    this.loadProcess.load('');
  }
}

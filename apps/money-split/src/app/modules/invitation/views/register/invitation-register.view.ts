import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from 'apps/money-split/src/app/components/register/register.component';
import { RoutingService } from 'apps/money-split/src/app/services/routing/routing.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RegisterComponent,
  ],
  selector: 'invitation-register-view',
  templateUrl: './invitation-register.view.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class InvitationRegisterView {
  public readonly routingService = inject(RoutingService);

  onSuccess = () => {
    this.routingService.goToInvitationLoginView();
  }
}

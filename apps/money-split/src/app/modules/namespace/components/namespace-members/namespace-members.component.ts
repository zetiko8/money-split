import { Component, Input, inject } from '@angular/core';
import { RoutingService } from '../../../../services/routing/routing.service';
import { NamespaceService } from '../../services/namespace.service';
import { UsersListComponent } from '../users-list/users-list.component';
import { NamespaceView } from '@angular-monorepo/entities';

@Component({
  standalone: true,
  imports: [
    UsersListComponent,
  ],
  selector: 'namespace-members',
  templateUrl: './namespace-members.component.html',
  providers: [
    NamespaceService,
  ],
})
export class NamespaceMembersComponent {
  public readonly routingService = inject(RoutingService);

  @Input() namespace!: NamespaceView;
}

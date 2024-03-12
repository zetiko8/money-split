import { Component, Input, inject } from '@angular/core';
import { RoutingService } from '../../../../services/routing/routing.service';
import { NamespaceService } from '../../services/namespace.service';
import { NamespaceView } from '@angular-monorepo/entities';
import { RecordsListComponent } from '../records-list/records-list.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [
    RecordsListComponent,
    TranslateModule,
  ],
  selector: 'namespace-records',
  templateUrl: './namespace-records.component.html',
  providers: [
    NamespaceService,
  ],
})
export class NamespaceRecordsComponent {
  public readonly routingService = inject(RoutingService);

  @Input() namespace!: NamespaceView;
}

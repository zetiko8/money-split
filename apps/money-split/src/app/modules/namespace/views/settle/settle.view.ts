import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { Observable, filter, map, merge, mergeMap, take } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { RoutingService } from '../../../../services/routing/routing.service';
import { NamespaceService } from '../../services/namespace.service';
import { combineLoaders } from '../../../../../helpers';
import { NamespaceHeaderComponent } from '../../components/namespace.header.component';
import { TranslateModule } from '@ngx-translate/core';
import { DebtSpecificationComponent } from '../../components/debt-specification/debt-specification.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    PageComponent,
    NamespaceHeaderComponent,
    DebtSpecificationComponent,
    TranslateModule,
  ],
  selector: 'settle-view',
  templateUrl: './settle.view.html',
  providers: [
    NamespaceService,
  ],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class SettleView {

  private readonly nameSpaceService = inject(NamespaceService);
  public readonly routingService = inject(RoutingService);

  public readonly loadProcess = new AsyncProcess(
    () => this.nameSpaceService.settlePreview(),
  );
  public readonly settleConfirmProcess = new AsyncProcess(
    () => this.preview$.pipe(take(1))
      .pipe(mergeMap(preview => this.nameSpaceService
        .settle(
          preview.namespace.ownerUsers[0].id,
          { records: preview.records.map(r => r.id) },
        ))),
  );

  public readonly preview$
    = this.loadProcess.share('');

  public readonly isLoading = combineLoaders([
    this.loadProcess.inProgress$,
    this.settleConfirmProcess.inProgress$,
  ]);

  public readonly notification$: Observable<Notification>
    = merge(
      this.loadProcess.error$,
      this.settleConfirmProcess.error$,
    )
      .pipe(
        filter(err => err !== null),
        map(event => {
          return { type: 'error', message: event?.message || 'Error' };
        }),
      );

  public settle () {
    this.settleConfirmProcess.execute('')
      .subscribe(() => this.routingService.goToNamespaceView());
  }
}

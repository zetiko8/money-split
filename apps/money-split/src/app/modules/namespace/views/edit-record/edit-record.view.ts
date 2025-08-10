import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { Observable, ReplaySubject, filter, map, merge, mergeMap, of, share, take, tap } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { NamespaceService } from '../../services/namespace.service';
import { combineLoaders } from '../../../../../helpers';
import { RoutingService } from '../../../../services/routing/routing.service';
import { CreatePaymentEventData, NamespaceView } from '@angular-monorepo/entities';
import { PaymentEventFormGroup } from '../../../../types';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentEventFormComponent } from '../../components/payment-event-form/payment-event-form.component';
import { getPaymentEventForm } from '../../components/payment-event-form/payment-event-form.component';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    PageComponent,
    TranslateModule,
    PaymentEventFormComponent,
  ],
  selector: 'edit-record',
  templateUrl: './edit-record.view.html',
  providers: [
    NamespaceService,
  ],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class EditRecordView {

  private readonly nameSpaceService = inject(NamespaceService);
  public readonly routingService = inject(RoutingService);
  private readonly route = inject(ActivatedRoute);

  public readonly loadProcess = new BoundProcess(
    () => this.route.params.pipe(
      take(1),
      map(params => params['recordId'] as number),
      mergeMap(
        recordId => this.nameSpaceService
          .getPaymentEventView(recordId),
      ),
    ),
  );
  public readonly editPaymentEventProcess = new BoundProcess(
    (data: {
      paymentEventId: number,
      data: CreatePaymentEventData
    }) => this.nameSpaceService.editPaymentEvent(data.paymentEventId, data.data)
      .pipe(
        tap(() => this.routingService.goToNamespaceView()),
      ),
  );

  public readonly formData$
    = merge(
      of(''),
    ).pipe(
      mergeMap(() => this.loadProcess.execute()),
      map(data => {
        const form = getPaymentEventForm(
          data.namespace.ownerUsers[0].id,
          data.paymentEvent,
        );

        return {
          namespace: data.namespace,
          form,
          recordId: data.paymentEvent.id,
        };
      }),
      share({ connector: () => new ReplaySubject<{
        namespace: NamespaceView,
        form: PaymentEventFormGroup,
        recordId: number,
      }>() }),
    );

  public readonly isLoading = combineLoaders([
    this.loadProcess.inProgress$,
    this.editPaymentEventProcess.inProgress$,
  ]);

  public readonly notification$: Observable<Notification>
    = merge(
      this.loadProcess.error$,
      this.editPaymentEventProcess.error$,
    )
      .pipe(
        filter(err => err !== null),
        map(event => {
          return { type: 'error', message: event?.message || 'Error' };
        }),
      );

  public addExpense (data: CreatePaymentEventData) {
    this.formData$
      .pipe(take(1))
      .subscribe(formData => {
        this.editPaymentEventProcess
          .execute({
            paymentEventId: formData.recordId,
            data,
          })
          .subscribe();
      });
  }
}

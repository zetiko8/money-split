import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { Observable, ReplaySubject, filter, map, merge, mergeMap, of, share, tap } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { NamespaceService } from '../../services/namespace.service';
import { combineLoaders } from '../../../../../helpers';
import { RoutingService } from '../../../../services/routing/routing.service';
import { CreatePaymentEventData } from '@angular-monorepo/entities';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentEventFormComponent, PaymentEventFormData } from '../../components/payment-event-form/payment-event-form.component';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    PageComponent,
    PaymentEventFormComponent,
    TranslateModule,
  ],
  selector: 'add-expense',
  templateUrl: './add-expense.view.html',
  providers: [
    NamespaceService,
  ],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class AddExpenseView {

  private readonly nameSpaceService = inject(NamespaceService);
  public readonly routingService = inject(RoutingService);

  public readonly loadProcess = new BoundProcess(
    () => this.nameSpaceService.getNamespace(),
  );
  public readonly addExpenseProcess = new BoundProcess(
    (recordData: CreatePaymentEventData) => this.nameSpaceService.addPaymentEvent(recordData)
      .pipe(
        tap(() => this.routingService.goToNamespaceView()),
      ),
  );

  public readonly formData$: Observable<PaymentEventFormData>
    = merge(
      of(''),
    ).pipe(
      mergeMap(() => this.loadProcess.execute()),
      map(namespace => {
        return { namespace, paymentEvent: null };
      }),
      share({ connector: () => new ReplaySubject<PaymentEventFormData>() }),
    );

  public readonly isLoading = combineLoaders([
    this.loadProcess.inProgress$,
    this.addExpenseProcess.inProgress$,
  ]);

  public readonly notification$: Observable<Notification>
    = merge(
      this.loadProcess.error$,
      this.addExpenseProcess.error$,
    )
      .pipe(
        filter(err => err !== null),
        map(event => {
          return { type: 'error', message: event?.message || 'Error' };
        }),
      );

  public addExpense (data: CreatePaymentEventData) {
    this.addExpenseProcess
      .execute(data)
      .subscribe();
  }
}

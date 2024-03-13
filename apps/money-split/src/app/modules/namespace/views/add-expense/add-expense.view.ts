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
import { CreateRecordData, NamespaceView } from '@angular-monorepo/entities';
import { RecordFormComponent, getRecordForm } from '../../components/record-form/record-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { RecordFormGroup } from '../../../../types';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    PageComponent,
    RecordFormComponent,
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
    () => this.nameSpaceService.getNamespace() 
  );
  public readonly addExpenseProcess = new BoundProcess(
    (recordData: CreateRecordData) => this.nameSpaceService.addRecord(recordData)
      .pipe(
        tap(() => this.routingService.goToNamespaceView()),
      ) 
  );

  public readonly formData$
    = merge(
      of(''),
    ).pipe(
      mergeMap(() => this.loadProcess.execute()),
      map(namespace => {
        const form = getRecordForm({
          createdBy: namespace.ownerUsers.length === 1 
            ? namespace.ownerUsers[0].id
            : undefined,
        });
        return { namespace, form }; 
      }),
      share({ connector: () => new ReplaySubject<{
        namespace: NamespaceView;
        form: RecordFormGroup;
      }>() }),
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

  public addExpense (data: CreateRecordData) {
    this.addExpenseProcess
      .execute(data)
      .subscribe();
  }
}

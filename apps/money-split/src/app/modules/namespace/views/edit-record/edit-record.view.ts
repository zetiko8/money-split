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
import { CreateRecordData, EditRecordData, NamespaceView } from '@angular-monorepo/entities';
import { RecordFormComponent, getRecordForm } from '../../components/record-form/record-form.component';
import { RecordFormGroup } from '../../../../types';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    PageComponent,
    RecordFormComponent,
    TranslateModule,
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
          .getEditRecordView(recordId)
      )
    ) 
  );
  public readonly editRecordProcess = new BoundProcess(
    (recordData: EditRecordData) => this.nameSpaceService.editRecord(recordData)
      .pipe(
        tap(() => this.routingService.goToNamespaceView()),
      ) 
  );

  public readonly formData$
    = merge(
      of(''),
    ).pipe(
      mergeMap(() => this.loadProcess.execute('')),
      map(data => {
        const form = getRecordForm({
          benefitors: data.record.data.benefitors
            .map(b => b.id),
          cost: data.record.data.cost,
          createdBy: data.record.createdBy.id,
          currency: data.record.data.currency,
          paidBy: data.record.data.paidBy
            .map(pb => pb.id),
        });

        return { 
          namespace: data.namespace, 
          form,
          recordId: data.record.id,
        };
      }),
      share({ connector: () => new ReplaySubject<{
        namespace: NamespaceView,
        form: RecordFormGroup,
        recordId: number,
      }>() }),
    );

  public readonly isLoading = combineLoaders([
    this.loadProcess.inProgress$,
    this.editRecordProcess.inProgress$,
  ]);

  public readonly notification$: Observable<Notification> 
    = merge(
      this.loadProcess.error$,
      this.editRecordProcess.error$,
    ) 
    .pipe(
      filter(err => err !== null),
      map(event => {
        return { type: 'error', message: event?.message || 'Error' };
      }),  
    );

  public addExpense (data: CreateRecordData) {
    this.formData$
      .pipe(take(1))
      .subscribe(formData => {
        this.editRecordProcess
          .execute({
            benefitors: data.benefitors,
            cost: data.cost,
            createdBy: data.createdBy,
            currency: data.currency,
            paidBy: data.paidBy,
            recordId: formData.recordId,
          })
          .subscribe();
      })
  }
}

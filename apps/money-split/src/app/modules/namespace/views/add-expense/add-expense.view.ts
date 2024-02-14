import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../../../components/page/page.component';
import { Observable, filter, map, merge, mergeMap, of, tap } from 'rxjs';
import { Notification } from '../../../../../components/notifications/notifications.types';
import { NamespaceService } from '../../services/namespace.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InviteOwnerComponent } from '../../components/invite/invite.component';
import { combineLoaders } from '../../../../../helpers';
import { UsersListComponent } from '../../components/users-list/users-list.component';
import { RoutingService } from '../../../../services/routing/routing.service';
import { CreateRecordData, RecordData } from '@angular-monorepo/entities';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    PageComponent,
    ReactiveFormsModule,
    InviteOwnerComponent,
    UsersListComponent,
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
  private readonly routingService = inject(RoutingService);

  public readonly loadProcess = new BoundProcess(
    () => this.nameSpaceService.getNamespace() 
  );
  public readonly addExpenseProcess = new BoundProcess(
    (recordData: CreateRecordData) => this.nameSpaceService.addRecord(recordData)
      .pipe(
        tap(() => this.routingService.goToNamespaceView()),
      ) 
  );

  public readonly namespace$
    = merge(
      of(''),
    ).pipe(
      mergeMap(() => this.loadProcess.execute('')),
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

  public form = new FormGroup({
    currency: new FormControl<string>('EUR', {
      validators: [
        (control) => {
            if (control.value === '') {
                return { required: true };
            } 
            else if (control.value === null) {
                return { required: true };
            } 
            else {
                return null;
            }
        }
      ],
      nonNullable: true,
    }),
    cost: new FormControl<number>(0, {
      validators: [
        (control) => {
            if (control.value <= 0) {
                return { required: true };
            } 
            else if (control.value === null) {
                return { required: true };
            } 
            else if ((Number.isNaN(control.value))) {
                return { required: true };
            } 
            else {
                return null;
            }
        }
      ],
      nonNullable: true,
    }),
    benefitors: new FormControl<number[]>([], {
      validators: [
        (control) => {
            if (control.value  && control.value.length === 0) {
                return { required: true };
            } else {
                return null;
            }
        }
      ],
      nonNullable: true,
    }),
    paidBy: new FormControl<number[]>([], {
      validators: [
        (control) => {
            if (control.value  && control.value.length === 0) {
                return { required: true };
            } else {
                return null;
            }
        }
      ],
      nonNullable: true,
    }),
    createdBy: new FormControl<number | null>(null, {
      validators: [
        (control) => {
            if (!control.value) {
                return { required: true };
            } else {
                return null;
            }
        }
      ],
    }),
  });

  public addExpense () {
    this.addExpenseProcess
      .execute(this.form.value as CreateRecordData)
      .subscribe();
  }

  public toogleBenefitor (
    userId: number
  ) {
    const benefitors = this.form.controls.benefitors.value;
    if (benefitors.includes(userId)) {
        this.form.controls.benefitors.setValue(
            benefitors.filter(id =>  id !== userId)
        );
    } else {
        this.form.controls.benefitors.setValue(
            [ ...benefitors, userId ]
        );
    }
  }

  public tooglePaidBy (
    userId: number
  ) {
    const paidBy = this.form.controls.paidBy.value;
    if (paidBy.includes(userId)) {
        this.form.controls.paidBy.setValue(
            paidBy.filter(id =>  id !== userId)
        );
    } else {
        this.form.controls.paidBy.setValue(
            [ ...paidBy, userId ]
        );
    }
  }

  public selectCreatedBy (
    userId: number
  ) {
    this.form.controls.createdBy.setValue(userId);
  }
}

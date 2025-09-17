import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { Observable, Subject, filter, map, merge, takeUntil, tap } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { RoutingService } from '../../../../services/routing/routing.service';
import { NamespaceService } from '../../services/namespace.service';
import { combineLoaders } from '../../../../../helpers';
import { NamespaceHeaderComponent } from '../../components/namespace.header.component';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentEventListComponent } from '../../components/payment-event-list/payment-event-list.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { getAllCurrenciesForPaymentEventView, NamespaceView, PaymentEventView, SettlementPayload } from '@angular-monorepo/entities';
import { SlideSwitcherComponent } from '@angular-monorepo/components';
import { HtmlAttributePipe } from '../../../../shared/pipes/html-attribute.pipe';
import { SettlementComponent, SettlementStateService } from '../../services/settlement.state.service';

type SettlementSettingsViewType = {
  separatedSettlementPerCurrencyControl: FormControl<boolean>;
  paymentEventsToSettle: PaymentEventView[];
  namespace: NamespaceView,
  checkboxes: { id: number, formControl: FormControl<boolean> }[];
  currenciesFb: FormGroup<{ [key: string]: FormControl<number> }>;
  currencies: string[];
  mainCurrencyControl: FormControl<string>;
};

@Component({
  standalone: true,
  imports: [
    CommonModule,
    PageComponent,
    NamespaceHeaderComponent,
    TranslateModule,
    PaymentEventListComponent,
    SlideSwitcherComponent,
    ReactiveFormsModule,
    HtmlAttributePipe,
  ],
  selector: 'settlement-settings-view',
  templateUrl: './settlement-settings.view.html',
  providers: [
    NamespaceService,
  ],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class SettlementSettingsView
  extends SettlementComponent implements OnDestroy {

  private readonly destroy$ = new Subject<void>();

  private readonly nameSpaceService = inject(NamespaceService);
  public readonly routingService = inject(RoutingService);
  public readonly settlementStateService = inject(SettlementStateService);
  public allSelected = true;
  public expandPaymentEvents = false;

  public readonly loadProcess = new AsyncProcess(
    () => this.nameSpaceService.settleSettings(),
  );

  public readonly settleConfirmProcess = new AsyncProcess(
    (payload: SettlementPayload) => this.nameSpaceService
      .settlePreview(payload)
      .pipe(
        tap((preview) => {
          this.settlementStateService.setPreview(preview);
          this.routingService.goToSettleView();
        }),
      ),
  );

  public readonly view$: Observable<SettlementSettingsViewType>
    = this.loadProcess.share('')
      .pipe(map(settings => {

        const fg: { id: number, formControl: FormControl<boolean> }[] = [];
        settings.paymentEventsToSettle.forEach(pe => {
          const control = {
            id: pe.id,
            formControl: new FormControl(true, { nonNullable: true }),
          };
          fg.push(control);
          control.formControl
            .valueChanges
            .pipe(
              takeUntil(this.destroy$),
            )
            .subscribe(() => {
              if (fg.every(c => c.formControl.value)) {
                this.allSelected = true;
              } else {
                this.allSelected = false;
              }
            });
        });

        const currencies
          = getAllCurrenciesForPaymentEventView(settings.paymentEventsToSettle);

        const separatedSettlementPerCurrencyControl
          = new FormControl<boolean>(true, { nonNullable: true });
        const mainCurrencyControl = new FormControl<string>(
          currencies[0], { nonNullable: true });
        const currenciesFb = new FormGroup({});

        currencies.forEach(currency => {
          currenciesFb.addControl(
            currency, new FormControl<number>(
              0,
              {
                nonNullable: true,
                validators: [
                  (control) => {
                    if (
                      control.value === null
                      || control.value == undefined
                      || control.value === ''
                    ) {
                      return { required: true };
                    }
                    else if ((Number.isNaN(Number(control.value)))) {
                      return { required: true };
                    }
                    else if (control.value < 0) {
                      return { required: true };
                    }
                    else {
                      return null;
                    }
                  },
                ],
              },
            ));
        });

        merge(
          mainCurrencyControl.valueChanges,
          separatedSettlementPerCurrencyControl.valueChanges
            .pipe(map(() => mainCurrencyControl.value)),
        )
          .pipe(
            takeUntil(this.destroy$),
          )
          .subscribe((currency) => {
            currenciesFb.reset();
            currenciesFb.get(currency)?.setValue(1);
          });

        return {
          separatedSettlementPerCurrencyControl,
          ...settings,
          checkboxes: fg,
          currenciesFb,
          currencies,
          mainCurrencyControl,
        };
      }));

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

  confirm (view: SettlementSettingsViewType) {
    // make a type out of payload
    type SettlementSettingsPayload = {
      separatedSettlementPerCurrency: boolean;
      currencies: { [key: string]: number };
      mainCurrency: string;
      paymentEvents: number[];
    };
    const payload: SettlementSettingsPayload = {
      separatedSettlementPerCurrency: view.separatedSettlementPerCurrencyControl.value,
      currencies: view.currenciesFb.value as { [key: string]: number },
      mainCurrency: view.mainCurrencyControl.value,
      paymentEvents: view.checkboxes
        .filter(cb => cb.formControl.value)
        .map(cb => cb.id),
    };

    this.settleConfirmProcess.execute(payload)
      .subscribe(() => this.routingService.goToSettleView());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

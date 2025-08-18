import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CreatePaymentEventData, CreateRecordData, NamespaceView, PaymentEvent } from '@angular-monorepo/entities';
import { PaymentEventSimpleFormData } from './simple/payment-event-simple-form.component';
import { PaymentEventViewHelpers } from '../../../../../helpers';
import { getPaymentEventForm, PaymentEventComplexFormComponent, PaymentEventComplexFormData } from './complex/payment-event-complex-form.component';
import { getRecordForm, PaymentEventSimpleFormComponent } from './simple/payment-event-simple-form.component';

export interface PaymentEventFormData {
  paymentEvent: PaymentEvent | null,
  namespace: NamespaceView,
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PaymentEventComplexFormComponent,
    PaymentEventSimpleFormComponent,
  ],
  selector: 'payment-event-form',
  templateUrl: './payment-event-form.component.html',
})
export class PaymentEventFormComponent {

  private _data: PaymentEventFormData | null = null;
  @Input() submitButtonText = '';
  @Input()
  set formData (data: PaymentEventFormData) {
    this._data = data;
    this.handleDataChange(data);
  }

  @Output() formSubmit = new EventEmitter<CreatePaymentEventData>();
  public paymentEventFormData: PaymentEventComplexFormData | null = null;
  public recordForm: PaymentEventSimpleFormData | null = null;
  public complex = false;

  submitRecordSimple (data: CreateRecordData) {
    const createPaymentEventData: CreatePaymentEventData = {
      paidBy: data.paidBy.map(item => ({
        userId: item,
        amount: data.cost / data.paidBy.length,
        currency: data.currency,
      })),
      benefitors: data.benefitors.map(item => ({
        userId: item,
        amount: data.cost / data.benefitors.length,
        currency: data.currency,
      })),
      description: data.description,
      notes: data.notes,
      createdBy: data.createdBy,
    };
    this.formSubmit.emit(createPaymentEventData);
  }

  changeToComplexMode (data: CreateRecordData) {
    if (!this._data) {
      throw new Error('Error: 345111:1');
    }

    this.complex = true;
    if (this._data.paymentEvent !== null) {
      const paymentEvent: PaymentEvent = {
        ...this._data.paymentEvent,
        benefitors: data.benefitors.map(item => ({
          userId: item,
          amount: data.cost / data.benefitors.length,
          currency: data.currency,
        })),
        paidBy: data.paidBy.map(item => ({
          userId: item,
          amount: data.cost / data.paidBy.length,
          currency: data.currency,
        })),
      };
      this.paymentEventFormData = {
        form: getPaymentEventForm(
          this._data.namespace.ownerUsers[0].id,
          paymentEvent,
        ),
        namespace: this._data.namespace,
      };
    } else {
      const paymentEvent: PaymentEvent = {
        benefitors: data.benefitors.map(item => ({
          userId: item,
          amount: data.cost / data.benefitors.length,
          currency: data.currency,
        })),
        paidBy: data.paidBy.map(item => ({
          userId: item,
          amount: data.cost / data.paidBy.length,
          currency: data.currency,
        })),
        created: new Date(),
        edited: new Date(),
        createdBy: data.createdBy,
        editedBy: data.createdBy,
        description: data.description,
        notes: data.notes,
        id: -1,
        namespaceId: this._data.namespace.id,
        settlementId: null,
      };
      this.paymentEventFormData = {
        form: getPaymentEventForm(
          this._data.namespace.ownerUsers[0].id,
          paymentEvent,
        ),
        namespace: this._data.namespace,
      };
    }
  }

  changeToSimpleMode (complexData: CreatePaymentEventData) {
    this.complex = false;
    const data = this._data;
    if (!data) throw new Error('Error: 345111:2');
    const { cost, currency } = PaymentEventViewHelpers.getComplexPaymentEventCostAndCurrencyForSimpleConversion(complexData);
    this.recordForm = {
      form: getRecordForm({
        createdBy: data.namespace.ownerUsers[0].id,
        cost,
        currency,
        paidBy: complexData.paidBy.map(item => item.userId),
        benefitors: complexData.benefitors.map(item => item.userId),
        description: complexData.description,
        notes: complexData.notes,
      }),
      namespace: data.namespace,
    };
  }

  private handleDataChange (data: PaymentEventFormData) {
    if (data.paymentEvent === null) {
      this.complex = false;
      this.recordForm = {
        form: getRecordForm({
          createdBy: data.namespace.ownerUsers[0].id,
        }),
        namespace: data.namespace,
      };
    } else {
      this.complex = !PaymentEventViewHelpers.isSimple(data.paymentEvent);
      if (this.complex) {
        this.paymentEventFormData = {
          form: getPaymentEventForm(
            data.namespace.ownerUsers[0].id,
            data.paymentEvent,
          ),
          namespace: data.namespace,
        };
      } else {
        const { cost, currency } = PaymentEventViewHelpers.getSimplePaymentEventCostAndCurrency(data.paymentEvent);
        this.recordForm = {
          form: getRecordForm({
            createdBy: data.namespace.ownerUsers[0].id,
            cost,
            currency,
            paidBy: data.paymentEvent.paidBy.map(item => item.userId),
            benefitors: data.paymentEvent.benefitors.map(item => item.userId),
            description: data.paymentEvent.description,
            notes: data.paymentEvent.notes,
          }),
          namespace: data.namespace,
        };
      }
    }
  }
}

import { CreatePaymentEventData, EditPaymentEventViewData, PaymentEvent, PaymentEventView } from '@angular-monorepo/entities';

export interface IPaymentEventService {
  getNamespacePaymentEventsView (
    namespaceId: number,
    ownerId: number,
  ): Promise<PaymentEventView[]>;

  getPaymentEvent (
    namespaceId: number,
    paymentEventId: number,
    ownerId: number,
  ): Promise<PaymentEvent>;

  editPaymentEvent (
    namespaceId: number,
    userId: number,
    paymentEventId: number,
    data: CreatePaymentEventData,
    ownerId: number,
  ): Promise<PaymentEvent>;

  addPaymentEvent (
    namespaceId: number,
    userId: number,
    data: CreatePaymentEventData,
    ownerId: number,
  ): Promise<PaymentEvent>;

  addPaymentEventBackdoor (
    payload: PaymentEvent,
  ): Promise<PaymentEvent>;

  getEditPaymentEventView (
    namespaceId: number,
    paymentEventId: number,
    ownerId: number,
  ): Promise<EditPaymentEventViewData>
};
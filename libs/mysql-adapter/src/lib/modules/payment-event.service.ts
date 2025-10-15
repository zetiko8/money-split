import { IPaymentEventService } from '@angular-monorepo/data-adapter';
import { getTransactionContext } from '../mysql-adapter';
import { CreatePaymentEventData, EditPaymentEventViewData, PaymentEvent, PaymentEventView } from '@angular-monorepo/entities';
import { Logger } from '@angular-monorepo/utils';
import { NamespaceHelpersService } from './namespace.helpers.service';
import { PaymentEventHelpersService } from './payment-event.helpers.service';

export class PaymentEventService implements IPaymentEventService {

  constructor(
    private readonly logger: Logger,
  ) {}

  async addPaymentEvent(
    namespaceId: number,
    userId: number,
    data: CreatePaymentEventData,
    ownerId: number,
  ): Promise<PaymentEvent> {
    return getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const res = await transaction.jsonProcedure<PaymentEvent>(
          'call addPaymentEvent(?, ?, ?, ?, ?, ?, ?);',
          [
            namespaceId,
            ownerId,
            userId,
            JSON.stringify(data.paidBy),
            JSON.stringify(data.benefitors),
            data.description ? data.description : null,
            data.notes ? data.notes : null,
          ],
        );

        res.paidBy = JSON.parse(res.paidBy as unknown as string);
        res.benefitors = JSON.parse(res.benefitors as unknown as string);

        return res;
      });
  }

  async editPaymentEvent(
    namespaceId: number,
    userId: number,
    paymentEventId: number,
    data: CreatePaymentEventData,
    ownerId: number,
  ): Promise<PaymentEvent> {
    return getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const res = await transaction.jsonProcedure<PaymentEvent>(
          'call editPaymentEvent(?, ?, ?, ?, ?, ?, ?, ?);',
          [
            namespaceId,
            ownerId,
            userId,
            paymentEventId,
            JSON.stringify(data.paidBy),
            JSON.stringify(data.benefitors),
            data.description ? data.description : null,
            data.notes ? data.notes : null,
          ],
        );

        res.paidBy = JSON.parse(res.paidBy as unknown as string);
        res.benefitors = JSON.parse(res.benefitors as unknown as string);

        return res;
      });
  }

  async getPaymentEvent (
    namespaceId: number,
    paymentEventId: number,
    ownerId: number,
  ): Promise<PaymentEvent> {
    return getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        return PaymentEventHelpersService
          .getPaymentEvent(transaction, namespaceId, paymentEventId, ownerId);
      });
  }

  async getNamespacePaymentEventsView (
    namespaceId: number,
    ownerId: number,
  ): Promise<PaymentEventView[]> {
    return getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        return PaymentEventHelpersService
          .getNamespacePaymentEventsView(transaction, namespaceId, ownerId);
      });
  }

  async addPaymentEventBackdoor (payload: PaymentEvent) {
    return getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const res = await transaction.jsonProcedure<PaymentEvent>(
          'call addPaymentEventBackdoor(?, ?, ?, ?, ?, ?, ?, ?);',
          [
            payload.namespaceId,
            payload.createdBy,
            JSON.stringify(payload.paidBy),
            JSON.stringify(payload.benefitors),
            payload.description ? payload.description : null,
            payload.notes ? payload.notes : null,
            new Date(payload.created),
            new Date(payload.edited),
          ],
        );

        res.paidBy = JSON.parse(res.paidBy as unknown as string);
        res.benefitors = JSON.parse(res.benefitors as unknown as string);

        return res;
      });
  }

  async getEditPaymentEventView (
    namespaceId: number,
    paymentEventId: number,
    ownerId: number,
  ): Promise<EditPaymentEventViewData> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const [namespace, paymentEvent] = await Promise.all([
          NamespaceHelpersService.getNamespaceViewForOwner(
            transaction,
            namespaceId,
            ownerId,
          ),
          PaymentEventHelpersService.getPaymentEvent(
            transaction,
            namespaceId,
            paymentEventId,
            ownerId,
          ),
        ]);

        return { namespace, paymentEvent };
      });
  }
}

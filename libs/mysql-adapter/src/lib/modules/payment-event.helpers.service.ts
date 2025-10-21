import { Transaction } from '../mysql-adapter';
import { PaymentEvent, PaymentEventView } from '@angular-monorepo/entities';
import { asyncMap } from '@angular-monorepo/utils';

export class PaymentEventHelpersService {
  static async getPaymentEvent (
    transaction: Transaction,
    namespaceId: number,
    paymentEventId: number,
    ownerId: number,
  ): Promise<PaymentEvent> {

    const res = await transaction.jsonProcedure<PaymentEvent>(
      'call getPaymentEvent(?, ?, ?);',
      [
        namespaceId,
        ownerId,
        paymentEventId,
      ],
    );

    return res;
  }

  static async getNamespacePaymentEventsView (
    transaction: Transaction,
    namespaceId: number,
    ownerId: number,
  ): Promise<PaymentEventView[]> {
    const res = await transaction.jsonProcedure<PaymentEventView[]>(
      'call getNamespacePaymentEvents(?, ?);',
      [
        namespaceId,
        ownerId,
      ],
    );

    return res.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  }

  static async getNamespacePaymentEvents (
    transaction: Transaction,
    namespaceId: number,
    ownerId: number,
  ): Promise<PaymentEvent[]> {

    const res = await transaction.jsonProcedure<PaymentEventView[]>(
      'call getNamespacePaymentEvents(?, ?)',
      [
        namespaceId,
        ownerId,
      ],
    );

    const paymentEvents = await asyncMap(res, async (paymentEventView) => {
      const paymentEvent: PaymentEvent = {
        id: paymentEventView.id,
        created: paymentEventView.created,
        edited: paymentEventView.edited,
        createdBy: paymentEventView.createdBy.id,
        editedBy: paymentEventView.editedBy.id,
        namespaceId: paymentEventView.namespace.id,
        settlementId: paymentEventView.settlementId,
        description: paymentEventView.description,
        notes: paymentEventView.notes,
        paidBy: paymentEventView.paidBy.map(node => ({
          userId: node.user.id,
          amount: node.amount,
          currency: node.currency,
        })),
        benefitors: paymentEventView.benefitors.map(node => ({
          userId: node.user.id,
          amount: node.amount,
          currency: node.currency,
        })),
      };

      return paymentEvent;
    });

    return paymentEvents.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  }

  static async addPaymentEventToSettlement (
    transaction: Transaction,
    paymentEventId: number,
    settlementId: number,
    addedBy: number,
    ownerId: number,
    namespaceId: number,
  ) {

    const updateSql = `
    UPDATE \`PaymentEvent\`
    SET
    settlementId = ?,
    edited = ?,
    editedBy = ?
    WHERE id = ?
`;
    await transaction.query(updateSql, [
      settlementId,
      new Date(),
      addedBy,
      paymentEventId,
    ]);
    return PaymentEventHelpersService
      .getPaymentEvent(transaction, namespaceId, paymentEventId, ownerId);
  }
}

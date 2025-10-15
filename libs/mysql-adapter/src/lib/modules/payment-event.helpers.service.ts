import { Transaction } from '../mysql-adapter';
import { PaymentEvent, PaymentEventView, PaymentEventViewFromDb, PaymentNode, PaymentNodeView } from '@angular-monorepo/entities';
import { NamespaceHelpersService } from './namespace.helpers.service';
import { asyncMap } from '@angular-monorepo/utils';
import { UserHelpersService } from './user.helpers.service';

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

    res.paidBy = JSON.parse(res.paidBy as unknown as string);
    res.benefitors = JSON.parse(res.benefitors as unknown as string);

    return res;
  }

  static async getNamespacePaymentEventsView (
    transaction: Transaction,
    namespaceId: number,
    ownerId: number,
  ): Promise<PaymentEventView[]> {
    const res = await transaction.jsonProcedure<PaymentEventViewFromDb[]>(
      'call getNamespacePaymentEvents(?, ?);',
      [
        namespaceId,
        ownerId,
      ],
    );

    const namespace = await NamespaceHelpersService.getNamespaceById(transaction, namespaceId);

    const paymentEventsViews = await asyncMap(res, async (paymentEventFromDb) => {
      const paymentEventView: PaymentEventView = {
        ...paymentEventFromDb,
        paidBy: [],
        benefitors: [],
        namespace: {
          id: namespace.id,
          name: namespace.name,
          avatarId: namespace.avatarId,
        },
      };
      paymentEventView.paidBy = await asyncMap(
          JSON.parse(paymentEventFromDb.paidBy) as PaymentNode[],
          async (paidByFromDb) => {
            const paidBy: PaymentNodeView = {
              amount: paidByFromDb.amount,
              currency: paidByFromDb.currency,
              user: await UserHelpersService.getUserById(transaction, paidByFromDb.userId),
            };
            return paidBy;
          });
      paymentEventView.benefitors = await asyncMap(
          JSON.parse(paymentEventFromDb.benefitors) as PaymentNode[],
          async (benefitorFromDb) => {
            const benefitor: PaymentNodeView = {
              amount: benefitorFromDb.amount,
              currency: benefitorFromDb.currency,
              user: await UserHelpersService.getUserById(transaction, benefitorFromDb.userId),
            };
            return benefitor;
          });
      return paymentEventView;
    });

    return paymentEventsViews.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  }

  static async getNamespacePaymentEvents (
    transaction: Transaction,
    namespaceId: number,
    ownerId: number,
  ): Promise<PaymentEvent[]> {

    const res = await transaction.jsonProcedure<PaymentEventViewFromDb[]>(
      'call getNamespacePaymentEvents(?, ?);',
      [
        namespaceId,
        ownerId,
      ],
    );

    const paymentEvents = await asyncMap(res, async (paymentEventFromDb) => {
      const paymentEvent: PaymentEvent = {
        ...paymentEventFromDb,
        paidBy: [],
        benefitors: [],
        namespaceId: paymentEventFromDb.namespaceId,
        createdBy: paymentEventFromDb.createdBy.id,
        editedBy: paymentEventFromDb.editedBy.id,
      };
      paymentEvent.paidBy = await asyncMap(
          JSON.parse(paymentEventFromDb.paidBy) as PaymentNode[],
          async (paidByFromDb) => {
            const paidBy: PaymentNode = {
              amount: paidByFromDb.amount,
              currency: paidByFromDb.currency,
              userId: paidByFromDb.userId,
            };
            return paidBy;
          });
      paymentEvent.benefitors = await asyncMap(
          JSON.parse(paymentEventFromDb.benefitors) as PaymentNode[],
          async (benefitorFromDb) => {
            const benefitor: PaymentNode = {
              amount: benefitorFromDb.amount,
              currency: benefitorFromDb.currency,
              userId: benefitorFromDb.userId,
            };
            return benefitor;
          });

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

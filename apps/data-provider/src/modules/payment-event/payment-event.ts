import { CreatePaymentEventData, PaymentEvent, PaymentEventView, PaymentEventViewFromDb, PaymentNode, PaymentNodeView } from '@angular-monorepo/entities';
import { jsonProcedure, mysqlDate } from '../../connection/helper';
import { appErrorWrap } from '../../helpers';
import { asyncMap } from '@angular-monorepo/utils';
import { USER_SERVICE } from '../user/user';
import { NAMESPACE_SERVICE } from '../namespace/namespace';

export const PAYMENT_EVENT_SERVICE = {
  getNamespacePaymentEventsView: async (
    namespaceId: number,
    ownerId: number,
  ): Promise<PaymentEventView[]> => {
    return await appErrorWrap('getNamespacePaymentEvents', async () => {
      const res = await jsonProcedure<PaymentEventViewFromDb[]>(
        `
        call getNamespacePaymentEvents(
          ${namespaceId},
          ${ownerId}
        );
        `,
      );

      const namespace = await NAMESPACE_SERVICE.getNamespaceById(namespaceId);

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
              user: await USER_SERVICE.getUserById(paidByFromDb.userId),
            };
            return paidBy;
          });
        paymentEventView.benefitors = await asyncMap(
          JSON.parse(paymentEventFromDb.benefitors) as PaymentNode[],
          async (benefitorFromDb) => {
            const benefitor: PaymentNodeView = {
              amount: benefitorFromDb.amount,
              currency: benefitorFromDb.currency,
              user: await USER_SERVICE.getUserById(benefitorFromDb.userId),
            };
            return benefitor;
          });
        return paymentEventView;
      });

      return paymentEventsViews.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    });
  },
  getNamespacePaymentEvents: async (
    namespaceId: number,
    ownerId: number,
  ): Promise<PaymentEvent[]> => {
    return await appErrorWrap('getNamespacePaymentEvents', async () => {
      const res = await jsonProcedure<PaymentEventViewFromDb[]>(
        `
        call getNamespacePaymentEvents(
          ${namespaceId},
          ${ownerId}
        );
        `,
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
    });
  },

  getPaymentEvent: async (
    namespaceId: number,
    paymentEventId: number,
    ownerId: number,
  ): Promise<PaymentEvent> => {
    return await appErrorWrap('getPaymentEvent', async () => {
      const res = await jsonProcedure<PaymentEvent>(
        `
        call getPaymentEvent(
          ${namespaceId},
          ${ownerId},
          ${paymentEventId}
        );
        `,
      );

      res.paidBy = JSON.parse(res.paidBy as unknown as string);
      res.benefitors = JSON.parse(res.benefitors as unknown as string);

      return res;
    });
  },

  editPaymentEvent: async (
    namespaceId: number,
    userId: number,
    paymentEventId: number,
    data: CreatePaymentEventData,
    ownerId: number,
  ): Promise<PaymentEvent> => {
    return await appErrorWrap('editPaymentEvent', async () => {
      const res = await jsonProcedure<PaymentEvent>(
        `
        call editPaymentEvent(
          ${namespaceId},
          ${ownerId},
          ${userId},
          ${paymentEventId},
          '${JSON.stringify(data.paidBy)}',
          '${JSON.stringify(data.benefitors)}',
          ${data.description ? `'${data.description}'` : 'NULL'},
          ${data.notes ? `'${data.notes}'` : 'NULL'}
        );
        `,
      );

      res.paidBy = JSON.parse(res.paidBy as unknown as string);
      res.benefitors = JSON.parse(res.benefitors as unknown as string);

      return res;
    });
  },

  addPaymentEvent: async (
    namespaceId: number,
    userId: number,
    data: CreatePaymentEventData,
    ownerId: number,
  ): Promise<PaymentEvent> => {
    return await appErrorWrap('addPaymentEvent', async () => {
      const res = await jsonProcedure<PaymentEvent>(
        `
        call addPaymentEvent(
          ${namespaceId},
          ${ownerId},
          ${userId},
          '${JSON.stringify(data.paidBy)}',
          '${JSON.stringify(data.benefitors)}',
          ${data.description ? `'${data.description}'` : 'NULL'},
          ${data.notes ? `'${data.notes}'` : 'NULL'}
        );
        `,
      );

      res.paidBy = JSON.parse(res.paidBy as unknown as string);
      res.benefitors = JSON.parse(res.benefitors as unknown as string);

      return res;
    });
  },

  addPaymentEventBackdoor: async (payload: PaymentEvent) => {
    return await appErrorWrap('addPaymentEventBackdoor', async () => {
      const res = await jsonProcedure<PaymentEvent>(
        `
        call addPaymentEventBackdoor(
          ${payload.namespaceId},
          ${payload.createdBy},
          '${JSON.stringify(payload.paidBy)}',
          '${JSON.stringify(payload.benefitors)}',
          ${payload.description ? `'${payload.description}'` : 'NULL'},
          ${payload.notes ? `'${payload.notes}'` : 'NULL'},
          '${mysqlDate(new Date(payload.created))}',
          '${mysqlDate(new Date(payload.edited))}'
        );
        `,
      );

      res.paidBy = JSON.parse(res.paidBy as unknown as string);
      res.benefitors = JSON.parse(res.benefitors as unknown as string);

      return res;
    });
  },
};

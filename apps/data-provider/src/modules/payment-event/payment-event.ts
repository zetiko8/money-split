import { CreatePaymentEventData, PaymentEvent } from '@angular-monorepo/entities';
import { jsonProcedure } from '../../connection/helper';
import { appErrorWrap } from '../../helpers';

export const PAYMENT_EVENT_SERVICE = {
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
};

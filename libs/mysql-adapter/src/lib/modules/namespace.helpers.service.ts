import {
  MNamespace,
  NamespaceView,
  PaymentEventView,
  PaymentNode,
  RecordData,
  RecordDataView,
  SettlementDebtView,
  SettlementListView,
} from '@angular-monorepo/entities';
import { Transaction } from '../mysql-adapter';
import { UserHelpersService } from './user.helpers.service';
import { asyncMap } from '@angular-monorepo/utils';

export class NamespaceHelpersService {

  /**
   * Get namespace by ID using an existing transaction.
   * Used in: user.router, payment-event controllers.
   * @throws Error if namespace not found
   */
  static async getNamespaceById(
    transaction: Transaction,
    id: number,
  ): Promise<MNamespace> {
    const namespace = (await transaction.query<MNamespace[]>(
      'SELECT * FROM `Namespace` WHERE id = ?',
      [id],
    ))[0];

    if (!namespace) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    return namespace;
  }

  /**
   * Map RecordData to RecordDataView by expanding user IDs to User objects.
   * Used in: settle, namespace controllers.
   */
  static async mapToRecordDataView(
    transaction: Transaction,
    record: RecordData,
  ): Promise<RecordDataView> {
    const benefitors = await asyncMap(
      record.benefitors,
      async benefitorId => await UserHelpersService.getUserById(transaction, benefitorId),
    );
    const paidBy = await asyncMap(
      record.paidBy,
      async paidById => await UserHelpersService.getUserById(transaction, paidById),
    );

    const data: RecordDataView = {
      cost: record.cost,
      currency: record.currency,
      benefitors,
      paidBy,
    };

    return data;
  }

  static async getNamespaceViewForOwner(
    transaction: Transaction,
    namespaceId: number,
    ownerId: number,
  ): Promise<NamespaceView> {
    const data = await transaction.jsonProcedure<NamespaceView & {
          paymentEvents: Array<Omit<PaymentEventView, 'paidBy' | 'benefitors'> & {
            paidBy: PaymentNode[];
            benefitors: PaymentNode[];
          }>;
          settlements: Array<Omit<SettlementListView, 'settleRecords'> & {
            settleRecords: Array<Omit<SettlementDebtView, 'data'> & { data: string }>;
          }>;
        }>(
          `
          call getNamespaceView(
            ${namespaceId},
            ${ownerId}
          );
          `,
        );

    const paymentEvents: PaymentEventView[] = await asyncMap(
      data.paymentEvents || [],
      async (pe) => {
        const paidBy = await asyncMap(pe.paidBy, async (node) => ({
          amount: node.amount,
          currency: node.currency,
          user: await UserHelpersService.getUserById(transaction, node.userId),
        }));

        const benefitors = await asyncMap(pe.benefitors, async (node) => ({
          amount: node.amount,
          currency: node.currency,
          user: await UserHelpersService.getUserById(transaction, node.userId),
        }));

        return {
          ...pe,
          paidBy,
          benefitors,
        };
      },
    );

    const settlements: SettlementListView[] = await asyncMap(
      data.settlements || [],
      async (settlement) => ({
        settlement: settlement.settlement,
        settledBy: settlement.settledBy,
        isAllSettled: settlement.isAllSettled,
        settleRecords: await asyncMap(
          settlement.settleRecords,
          async (record): Promise<SettlementDebtView> => {
            const parsedData = await NamespaceHelpersService.mapToRecordDataView(
              transaction,
              JSON.parse(record.data),
            );
            return {
              id: record.id,
              created: record.created,
              edited: record.edited,
              createdBy: record.createdBy,
              editedBy: record.editedBy,
              settled: record.settled,
              settlementId: record.settlementId,
              settledOn: record.settledOn,
              settledBy: record.settledBy,
              data: parsedData,
            };
          },
        ),
      }),
    );

    const namespaceView: NamespaceView = {
      id: data.id,
      name: data.name,
      avatarId: data.avatarId,
      invitations: data.invitations || [],
      users: data.users || [],
      ownerUsers: data.ownerUsers || [],
      paymentEvents,
      hasRecordsToSettle: data.hasRecordsToSettle,
      settlements,
    };

    namespaceView.paymentEvents.sort((a, b) => a.created < b.created ? 1 : -1);

    return namespaceView;
  }

  static async ownerHasAccessToNamespace (
    transaction: Transaction,
    ownerId: number,
    namespaceId: number,
  ): Promise<boolean> {
    const namespaces = await NamespaceHelpersService
      .getNamespacesForOwner(transaction, ownerId);

    return namespaces.some(namespace => namespace.id === namespaceId);
  }

  static async getNamespacesForOwner(
    transaction: Transaction,
    ownerId: number,
  ): Promise<MNamespace[]> {
    const result = await transaction.jsonProcedure<MNamespace[]>(
      'call getOwnerNamespaces(?);',
      [ownerId],
    );
    return result;
  }
}

import { Settlement, SettlementPayload, SettlementPreview, SettlementSettings } from '@angular-monorepo/entities';

export interface ISettleService {
  getSettleSettings (
    namespaceId: number,
    ownerId: number,
  ): Promise<SettlementSettings>;

  settleNamespacePreview (
    namespaceId: number,
    payload: SettlementPayload,
    ownerId: number,
  ): Promise<SettlementPreview>;

  settle (
    byUser: number,
    namespaceId: number,
    payload: SettlementPayload,
    ownerId: number,
  ): Promise<Settlement>;

  setDebtIsSettled (
    byUser: number,
    debtId: number,
    isSettled: boolean,
  ): Promise<void>;
}

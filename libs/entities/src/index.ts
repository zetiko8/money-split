export interface MNamespace {
    id: number,
    name: string,
    avatarId: number,
}

export interface NamespaceView extends MNamespace {
    invitations: Invitation[],
    users: User[],
    ownerUsers: User[],
    records: RecordView[],
    hasRecordsToSettle: boolean,
    settlements: SettlementListView[],
}

export interface Owner {
    id: number,
    key: string,
    username: string,
    avatarId: number,
}

export interface RegisterOwnerPayload {
    password: string,
    username: string,
    avatarColor: string | null,
    avatarUrl: string | null,
}

export interface CreateNamespacePayload {
    namespaceName: string,
    avatarColor: string | null,
    avatarUrl: string | null,
}

export interface User {
    id: number,
    key: string,
    ownerId: number,
    name: string,
    avatarId: number,
}

export interface ViewUserViewData {
  user: User,
  namespace: MNamespace,
}

export interface Invitation {
    id: number,
    email: string,
    created: Date,
    edited: Date,
    createdBy: number,
    editedBy: number,
    accepted: boolean,
    rejected: boolean,
    invitationKey: string,
    namespaceId: number,
};

export interface InvitationViewData {
    id: number,
    email: string,
    created: Date,
    edited: Date,
    createdBy: number,
    editedBy: number,
    accepted: boolean,
    rejected: boolean,
    invitationKey: string,
    namespace: MNamespace,
};

export interface RecordData {
    benefitors: number[],
    cost: number,
    currency: string,
    paidBy: number[],
}

export interface SettlePayload {
    records: number[],
}

export interface RecordDataCy {
    benefitors: string[],
    cost: number,
    currency: string,
    paidBy: string[],
    created: Date,
    edited: Date,
}

export interface RecordDataBackdoor {
    benefitors: number[],
    cost: number,
    currency: string,
    paidBy: number[],
    created: Date,
    edited: Date,
    addingOwnerId: number,
    addingUserId: number,
}

export interface RecordDataView {
    benefitors: User[],
    cost: number,
    currency: string,
    paidBy: User[],
}

export interface CreateRecordData {
    benefitors: number[],
    cost: number,
    currency: string,
    paidBy: number[],
    createdBy: number,
}

export interface EditRecordData {
    benefitors: number[],
    cost: number,
    currency: string,
    paidBy: number[],
    createdBy: number,
    recordId: number,
}

export interface Record {
    id: number,
    created: Date,
    edited: Date,
    createdBy: number,
    editedBy: number,
    data: RecordData,
    namespaceId: number,
    settlementId: number | null,
}

export interface EditPaymentEventViewData {
  namespace: NamespaceView;
  paymentEvent: PaymentEvent;
}

export interface PaymentEvent {
  paidBy: PaymentNode[],
  benefitors: PaymentNode[],
  id: number,
  created: Date,
  edited: Date,
  createdBy: number,
  editedBy: number,
  namespaceId: number,
  settlementId: number | null,
  description: string,
  notes: string,
}

export interface CreatePaymentEventData {
  paidBy: PaymentNode[];
  benefitors: PaymentNode[];
  description: string | null;
  notes: string | null;
  createdBy: number;
}

export interface PaymentNode {
  userId: number,
  amount: number,
  currency: string,
}

export interface Settlement {
    id: number,
    created: Date,
    edited: Date,
    createdBy: number,
    editedBy: number,
}

export interface SettlementDebt extends Record {
    settled: boolean,
    settledOn: Date | null,
    settledBy: number | null,
}

export interface RecordView {
    id: number,
    created: Date,
    edited: Date,
    createdBy: User,
    editedBy: User,
    data: RecordDataView,
    namespace: MNamespace,
    settlementId: number | null,
    settledOn: Date | null,
}

export interface SettlementDebtView extends SettlementRecord {
    id: number,
    created: Date,
    edited: Date,
    createdBy: User,
    editedBy: User,
    settlementId: number | null,
}

export interface AvatarData {
    id: number,
    color: string,
    url: string,
}

export interface OwnerProfileView {
    users: {
        user: User,
        avatar: AvatarData,
    }[],
    owner: Owner,
    avatar: AvatarData,
}

export interface EditAvatarData {
    avatarColor: string | null,
    avatarUrl: string | null,
}

export interface EditProfileData {
    ownerAvatar: EditAvatarData,
}

export interface Debt {
    debtor: number,
    creditor: number,
    value: number,
}

export interface SettlementPreview {
    settleRecords: SettlementRecord[];
    records: RecordView[];
    namespace: NamespaceView,
}

export interface SettlementListView {
    settlement: Settlement,
    settleRecords: SettlementDebtView[];
    settledBy: User,
    isAllSettled: boolean,
}

export interface SettlementRecord {
    data: RecordDataView,
    settled: boolean,
    settledOn: Date,
    settledBy: User | null,
}

export enum OwnerRole {
  'USER' = 'USER',
  'ADMIN' = 'ADMIN',
}

export interface OwnerRoleDb {
  id: number,
  ownerId: number,
  role: OwnerRole,
}

export interface MNamespaceSettings {
  namespaceName: string,
  avatarColor: string | null,
  avatarUrl: string | null,
}

export * from './error';
export * from './constants';

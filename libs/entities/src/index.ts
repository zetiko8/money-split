export interface MNamespace {
    id: number,
    name: string,
}

export interface NamespaceView extends MNamespace {
    invitations: Invitation[],
    users: User[],
    ownerUsers: User[],
}

export interface Owner {
    id: number,
    key: string,
    username: string,
}

export interface User {
    id: number,
    key: string,
    ownerId: number,
    name: string,
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

export interface CreateRecordData {
    benefitors: number[],
    cost: number,
    currency: string,
    paidBy: number[],
    createdBy: number,
}

export * from './error';

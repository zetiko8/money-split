export interface MNamespace {
    id: number,
    name: string,
}

export interface NamespaceView extends MNamespace {
    invitations: Invitation[],
    users: User[],
    ownerUsers: User[],
    records: RecordView[],
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
    avatarImage: string | null,
}

export interface User {
    id: number,
    key: string,
    ownerId: number,
    name: string,
    avatarId: number,
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

export interface RecordDataCy {
    benefitors: string[],
    cost: number,
    currency: string,
    paidBy: string[],
    created: Date,
    edited: Date,
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
}

export interface RecordView {
    id: number,
    created: Date,
    edited: Date,
    createdBy: User,
    editedBy: User,
    data: RecordDataView,
    namespace: MNamespace,
}

export interface AvatarData {
    id: number,
    color: string,
    dataUrl: string,
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
    avatarImage: string | null,
}

export interface EditProfileData {
    ownerAvatar: EditAvatarData,
}

export interface Debt {
    debtor: number,
    creditor: number,
    value: number,
}

export * from './error';

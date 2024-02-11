export interface MNamespace {
    id: number,
    name: string,
}

export interface NamespaceView extends MNamespace {
    invitations: Invitation[],
    users: User[],
}

export interface Owner {
    id: number,
    key: string,
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

export * from './error';

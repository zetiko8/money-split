import { Invitation, MNamespace, Owner, RecordDataCy } from "@angular-monorepo/entities";

function getRandomColor () {
    return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
}

export const ACTIONS = {
    registerOwner: (
        username: string,
        password: string,
    ) => {
        return cy.request<Owner>({
            url: 'http://localhost:3333/app/register',
            body: {
                username,
                password,
                avatarColor: getRandomColor(),
                avatarImage: null,
            },
            method: 'POST'
        }).then(res => res.body);
    },
    deleteOwner: (
        username: string,
    ) => {
        cy.request(
            'DELETE', 
            'http://localhost:3333/cybackdoor/owner/' + username
            ).then((response) => {
                expect(response.status).to.equal(200);
            });
    },
    login: (
        username: string,
        password: string,
    ) => {
        return cy.request<{ token: string }>({
            url: 'http://localhost:3333/app/login',
            body: {
                username,
                password
            },
            method: 'POST'
        }).then(res => {
            cy.window().then(win => {
                win.localStorage.setItem('token', res.body.token);
            })
        });
    },
    createNamespace (
        name: string,
        ownerKey: string,
    ) {
        return cy.request<MNamespace>({
            url: `http://localhost:3333/cybackdoor/${ownerKey}/namespace`,
            body: {
                name,
            },
            method: 'POST'
        }).then(res => res.body);
    },
    deleteNamespace (
        namespaceId: number,
    ) {
        return cy.request<MNamespace>({
            url: `http://localhost:3333/cybackdoor/namespace/${namespaceId}`,
            method: 'DELETE'
        }).then(res => res.body);
    },
    deleteNamespaceByName (
        namespaceName: string,
    ) {
        return cy.request<MNamespace>({
            url: `http://localhost:3333/cybackdoor/namespaceName/${namespaceName}`,
            method: 'DELETE'
        }).then(res => res.body);
    },
    deleteInvitation (
        email: string,
    ) {
        return cy.request<Invitation>({
            url: `http://localhost:3333/cybackdoor/invitation/${email}`,
            method: 'DELETE'
        }).then(res => res.body);
    },
    createInvitation (
        email: string,
    ) {
        return cy.request<Invitation>({
            url: `http://localhost:3333/cybackdoor/invitation/${email}`,
            method: 'DELETE'
        }).then(res => res.body);
    },
    invite (
        ownerKey: string,
        namespaceId: number,
        email: string
    ) {
        return cy.request<Invitation>({
            url: `http://localhost:3333/app/${ownerKey}/namespace/${namespaceId}/invite`,
            method: 'POST',
            body: { email }
        }).then(res => res.body);
    },
    acceptInvitation (
        ownerUsername: string,
        name: string,
        email: string
    ) {
        return cy.request<Invitation>({
            url: `http://localhost:3333/cybackdoor/invitation/accept`,
            method: 'POST',
            body: { email, name, ownerUsername }
        }).then(res => res.body);
    },
    addRecord (
        namespaceName: string,
        createdBy: string,
        record: RecordDataCy,
    ) {
        return cy.request<Invitation>({
            url: `http://localhost:3333/cybackdoor/record/${namespaceName}/${createdBy}`,
            method: 'POST',
            body: record,
        }).then(res => res.body);
    }
}
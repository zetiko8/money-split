import { MNamespace, Owner } from "@angular-monorepo/entities";
import { ACTIONS } from "./actions";

export interface TestUser {
    username: string,
    password?: string,
    email?: string,
}

interface PTestUser {
    username: string,
    password: string,
    email: string,
}

export function prepareNamespace (
    namespaceName: string,
    creator: TestUser,
    users: TestUser[],
) {

    const pCreator: PTestUser = {
        username: creator.username,
        password: creator.password || 'testpassword',
        email: creator.username + '@testemail.com',
    }

    const pUsers: PTestUser[] = users.map(user => {
        return {
            username: user.username,
            password: user.password || 'testpassword',
            email: user.username + '@testemail.com'
        }
    });

    const cleanup = () => {
        [ creator, ...users ]
            .forEach(user => ACTIONS.deleteOwner(user.username));
        ACTIONS.deleteNamespaceByName(namespaceName);
        pUsers
            .forEach(user => ACTIONS.deleteInvitation(user.email));
    }

    return {
        before: () => {
            let owner!: Owner;
            let namespace!: MNamespace;
            
            cleanup();
            pUsers
                .forEach(user => ACTIONS.registerOwner(
                    user.username, user.password,
                ));
            ACTIONS.registerOwner(
                pCreator.username, pCreator.password
            )
                .then(ownerRes => {
                    owner = ownerRes;
                    ACTIONS.createNamespace(
                        namespaceName, owner.key)
                        .then(namespaceRes => {
                            namespace = namespaceRes;
                            pUsers.forEach(user => ACTIONS.invite(
                                ownerRes.key,
                                namespaceRes.id,
                                user.email,
                            ));
                        })
                });
            
            pUsers.forEach(user => ACTIONS.acceptInvitation(
                user.username, user.username, user.email));

            ACTIONS.login(pCreator.username, pCreator.password);
        
            return cy.then(() => cy.wrap({ 
                namespace, 
                owner,
                creator: pCreator,
                users: pUsers, 
            }));
        },
        after: () => cleanup(),
    };
}
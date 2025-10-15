import { MNamespace, Owner, Record, RecordDataCy } from '@angular-monorepo/entities';
import { ACTIONS } from './actions';

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

function prepareRealmInternal (
  creator: TestUser,
) {
  const pCreator: PTestUser = {
    username: creator.username,
    password: creator.password || 'testpassword',
    email: creator.username + '@testemail.com',
  };

  const cleanup = () => {
    ACTIONS.deleteOwner(creator.username);
  };

  return {
    setup: () => {
      let owner!: Owner;

      cleanup();
      ACTIONS.registerOwner(
        pCreator.username, pCreator.password,
      )
        .then(ownerRes => {
          owner = ownerRes;
        });

      return cy.then(() => cy.wrap({
        owner,
        creator: pCreator,
      }));
    },
    cleanup,
    creator: pCreator,
  };
}

export function prepareRealm (
  creator: TestUser,
) {

  const prepareRealmP = prepareRealmInternal(creator);

  const cleanup = () => {
    prepareRealmP.cleanup();
    ACTIONS.logout();
  };

  return {
    before: () => {
      let owner!: Owner;

      cleanup();
      prepareRealmP.setup()
        .then(res => {
          owner = res.owner;
        });
      ACTIONS.login(
        prepareRealmP.creator.username,
        prepareRealmP.creator.password,
      );

      return cy.then(() => cy.wrap({
        owner,
        creator: prepareRealmP.creator,
      }));
    },
    after: () => cleanup(),
  };

}

export function prepareNamespace (
  namespaceName: string,
  creator: TestUser,
  users: TestUser[],
  records: { user: string, record: RecordDataCy }[] = [],
) {
  const prepareRealmP = prepareRealmInternal(creator);

  const pUsers: PTestUser[] = users.map(user => {
    return {
      username: user.username,
      password: user.password || 'testpassword',
      email: user.username + '@testemail.com',
    };
  });

  const cleanup = () => {
    prepareRealmP.cleanup();
    users
      .forEach(user => ACTIONS.deleteOwner(user.username));
    [ creator, ...users ]
      .forEach(user => ACTIONS.deleteUser(user.username));
    pUsers
      .forEach(user => ACTIONS.deleteInvitation(user.email));
  };

  return {
    before: () => {
      let owner!: Owner;
      let namespace!: MNamespace;

      cleanup();
      pUsers
        .forEach(user => ACTIONS.registerOwner(
          user.username, user.password,
        ));
      prepareRealmP.setup()
        .then(res => {
          owner = res.owner;
          ACTIONS.createNamespace(
            namespaceName, owner.key)
            .then(namespaceRes => {
              namespace = namespaceRes;
              pUsers.forEach(user => ACTIONS.invite(
                owner.key,
                namespaceRes.id,
                user.email,
              ));
            });
        });

      pUsers.forEach(user => ACTIONS.acceptInvitation(
        user.username, user.username, user.email));

      ACTIONS.login(
        prepareRealmP.creator.username,
        prepareRealmP.creator.password,
      );

      const recordsToReturn: Record[] = [];

      records.forEach(record => ACTIONS.addRecord(
        namespaceName,
        record.user,
        record.record,
      ).then(returnedRecord => {
        recordsToReturn.push(returnedRecord);
      }));

      return cy.then(() => cy.wrap({
        namespace,
        owner,
        creator: prepareRealmP.creator,
        users: pUsers,
        records: recordsToReturn,
      }));
    },
    after: () => cleanup(),
  };
}
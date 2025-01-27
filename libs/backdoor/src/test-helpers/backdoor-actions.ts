import { Invitation, MNamespace, Owner, Record, RecordDataCy, User } from '@angular-monorepo/entities';
import axios from 'axios';
import { TestOwner } from './test-owner';
import { asyncMap } from '@angular-monorepo/utils';

export function getRandomColor () {
  return '#000000'.replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
}

export interface TestUser {
  username: string,
  password?: string,
}

interface TestNamespaceUserData {
  user: User,
  owner: TestOwner,
}

export interface TestScenarioNamespace {
  creator: TestNamespaceUserData,
  allUsers: TestNamespaceUserData[],
  addedRecords: Record[],
  namespaceId: number,
  namespace: MNamespace,
}

export async function prepareNamespace (
  DATA_PROVIDER_URL: string,
  BACKDOOR_USERNAME: string,
  BACKDOOR_PASSWORD: string,
  namespaceName: string,
  creator: TestUser,
  users: TestUser[],
  records: { user: string, record: RecordDataCy }[] = [],
): Promise<TestScenarioNamespace> {
  const creatorOwner = new TestOwner(
    DATA_PROVIDER_URL,
    creator.username,
    creator.password || 'testpassword',
  );
  await creatorOwner.dispose();
  await creatorOwner.register();

  const namespace = await creatorOwner.createNamespace(namespaceName);
  const namespaceId = namespace.id;

  const addedOwner: TestOwner[] = await asyncMap(users, async user => {
    return await creatorOwner.addOwnerToNamespace(
      namespaceId,
      {
        name: user.username,
      },
    );
  });
  const creatorUser
    = await creatorOwner.getUserForNamespace(namespaceId);

  const creatorNamespaceData: TestNamespaceUserData
    = {
      owner: creatorOwner,
      user: creatorUser,
    };

  const addedUsers: TestNamespaceUserData[] = await asyncMap<TestOwner, TestNamespaceUserData>
  (addedOwner, async owner => {
    const user = await owner.getUserForNamespace(namespaceId);
    return {
      user,
      owner,
    };
  });

  await creatorOwner.backdoorLogin({
    username: BACKDOOR_USERNAME,
    password: BACKDOOR_PASSWORD,
  });

  const allUsers: TestNamespaceUserData[] = [
    creatorNamespaceData,
    ...addedUsers,
  ];

  const addedRecords = await asyncMap(records, async (rec) => {
    const adder = allUsers.find(u => u.user.name === rec.user);

    if (!adder) throw Error('Adder not found: ' + rec.user);

    const res = await creatorOwner.addRecordToNamespace(namespaceId, {
      benefitors: rec.record.benefitors.map(b => {
        const found = allUsers.find(u => u.user.name = b);
        if (!found) throw Error('Benefitor not found: ' + rec.user);
        return found.user.id;
      }),
      cost: rec.record.cost,
      currency: rec.record.currency,
      paidBy: rec.record.paidBy.map(p => {
        const found = allUsers.find(u => u.user.name = p);
        if (!found) throw Error('Payer not found: ' + rec.user);
        return found.user.id;
      }),
      created: rec.record.created,
      edited: rec.record.edited,
      addingOwnerId: adder.owner.owner.id,
      addingUserId: adder.user.id,
    });

    return res;
  });

  return {
    creator: creatorNamespaceData,
    allUsers,
    addedRecords,
    namespaceId,
    namespace,
  };
}

export const BACKDOOR_ACTIONS = {
  query: async (
    DATA_PROVIDER_URL: string,
    sql: string,
  ) => {
    const res = await  axios.post<unknown>(
      DATA_PROVIDER_URL + '/cybackdoor/sql',
      {
        sql,
      },
    );

    return res.data;
  },
  registerOwner: async (
    DATA_PROVIDER_URL: string,
    username: string,
    password: string,
  ) => {
    const res = await  axios.post<Owner>(
      DATA_PROVIDER_URL + '/app/register',
      {
        username,
        password,
        avatarColor: getRandomColor(),
        avatarUrl: null,
      },
    );

    return res.data;
  },
  deleteOwner: async (
    DATA_PROVIDER_URL: string,
    username: string,
  ) => {
    return await axios
      .delete(`${DATA_PROVIDER_URL}/cybackdoor/owner/${username}`);
  },
  deleteUser: async (
    DATA_PROVIDER_URL: string,
    username: string,
  ) => {
    return await axios
      .delete(`${DATA_PROVIDER_URL}/cybackdoor/user/${username}`);
  },
  login: async (
    DATA_PROVIDER_URL: string,
    username: string,
    password: string,
  ) => {
    const res = await  axios.post<{ token: string }>(
      DATA_PROVIDER_URL + '/app/login',
      {
        username,
        password,
      },
    );

    return res.data;
  },
  createNamespace: async (
    DATA_PROVIDER_URL: string,
    name: string,
    ownerKey: string,
  ) => {
    const res = await  axios.post<MNamespace>(
      `${DATA_PROVIDER_URL}/cybackdoor/${ownerKey}/namespace`,
      {
        name,
      },
    );

    return res.data;
  },
  deleteNamespace: async (
    DATA_PROVIDER_URL: string,
    namespaceId: number,
  ) => {
    return await axios
      .delete(`${DATA_PROVIDER_URL}/cybackdoor/namespace/${namespaceId}`);
  },
  deleteNamespaceByName: async (
    DATA_PROVIDER_URL: string,
    namespaceName: string,
  ) => {
    return await axios
      .delete(`${DATA_PROVIDER_URL}/cybackdoor/namespaceName/${namespaceName}`);
  },
  deleteInvitation: async (
    DATA_PROVIDER_URL: string,
    email: string,
  ) => {
    return await axios
      .delete(`${DATA_PROVIDER_URL}/cybackdoor/invitation/${email}`);
  },
  invite: async (
    DATA_PROVIDER_URL: string,
    token: string,
    ownerKey: string,
    namespaceId: number,
    email: string,
  ) => {
    const res = await axios.post<Invitation>(
      `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
      {
        email,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      },
    );

    return res.data;
  },
  acceptInvitation: async (
    DATA_PROVIDER_URL: string,
    ownerUsername: string,
    name: string,
    email: string,
  ) => {
    const res = await axios.post<Invitation>(
      `${DATA_PROVIDER_URL}/cybackdoor/invitation/accept`,
      { email, name, ownerUsername },
    );

    return res.data;
  },
  addRecord: async (
    DATA_PROVIDER_URL: string,
    namespaceName: string,
    createdBy: string,
    record: RecordDataCy,
  ) => {
    const res = await axios.post<Record>(
      `${DATA_PROVIDER_URL}/cybackdoor/record/${namespaceName}/${createdBy}`,
      record,
    );

    return res.data;
  },
  settleRecords: async (
    DATA_PROVIDER_URL: string,
    namespaceName: string,
    byUsername: string,
    records: number[],
    settledOn: Date,
  ) => {
    const res = await axios.post<void>(
      `${DATA_PROVIDER_URL}/cybackdoor/settle/${namespaceName}/${byUsername}`,
      { records, settledOn },
    );

    return res.data;
  },
  deleteNamespaceInvitations: async (
    DATA_PROVIDER_URL: string,
    namespaceId: number,
  ) => {
    await BACKDOOR_ACTIONS.query(
      DATA_PROVIDER_URL,
      `
      DELETE  FROM Invitation WHERE namespaceId=${namespaceId}
      `,
    );
  },
  SCENARIO: {
    prepareNamespace,
  },
};
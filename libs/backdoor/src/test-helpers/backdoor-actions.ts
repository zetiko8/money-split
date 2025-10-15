import { Invitation, MNamespace, Owner, PaymentEvent, PaymentNode, Record, RecordDataCy, User } from '@angular-monorepo/entities';
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
  addedPaymentEvents: PaymentEvent[],
  namespaceId: number,
  namespace: MNamespace,
  nonCreatorUsers: TestNamespaceUserData[],
  user: { [key: string]: User },
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
  await TestOwner.dispose(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, creator.username);
  await creatorOwner.register();

  const namespace = await creatorOwner.createNamespace(namespaceName);
  const namespaceId = namespace.id;

  const addedOwner: TestOwner[] = await asyncMap(users, async user => {
    return await creatorOwner.addOwnerToNamespace(
      BACKDOOR_USERNAME,
      BACKDOOR_PASSWORD,
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

  const nonCreatorUsers: TestNamespaceUserData[] = [
    ...addedUsers,
  ];

  const addedPaymentEvents = await asyncMap(records, async (rec) => {
    const adder = allUsers.find(u => u.user.name === rec.user);

    if (!adder) throw Error('Adder not found: ' + rec.user);

    const createPaymentEventData: PaymentEvent = {
      benefitors: rec.record.benefitors.map(b => {
        const found = allUsers.find(u => u.user.name === b);
        if (!found) throw Error('Benefitor not found: ' + rec.user);
        const pn: PaymentNode = {
          amount: rec.record.cost / rec.record.benefitors.length,
          currency: rec.record.currency,
          userId: found.user.id,
        };
        return pn;
      }),
      paidBy: rec.record.paidBy.map(p => {
        const found = allUsers.find(u => u.user.name === p);
        if (!found) throw Error('Payer not found: ' + rec.user);
        const pn: PaymentNode = {
          amount: rec.record.cost / rec.record.paidBy.length,
          currency: rec.record.currency,
          userId: found.user.id,
        };
        return pn;
      }),
      createdBy: adder.user.id,
      description: '',
      notes: '',
      created: rec.record.created,
      namespaceId,
      edited: rec.record.edited,
      id: -1,
      editedBy: -1,
      settlementId: null,
    };

    const res = await creatorOwner.addPaymentEventToNamespaceBackdoor(
      createPaymentEventData,
    );

    return res;
  });

  const userDict: { [key: string]: User } = {};
  allUsers.forEach(u => {
    userDict[u.user.name] = u.user;
  });

  return {
    creator: creatorNamespaceData,
    allUsers,
    addedPaymentEvents,
    namespaceId,
    namespace,
    nonCreatorUsers,
    user: userDict,
  };
}

export const BACKDOOR_ACTIONS = {
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
  SCENARIO: {
    prepareNamespace,
    scenarios: {
      1: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        moment: any,
        DATA_PROVIDER_URL: string,
        BACKDOOR_USERNAME: string,
        BACKDOOR_PASSWORD: string,
      ) => {

        const firstDate = moment().set({
          year: 2024,
          month: 2,
          date: 15,
        }).toDate();

        const secondDate = moment(firstDate)
          .subtract(2, 'hours').toDate();
        const thirdDate = moment(firstDate)
          .subtract(1, 'day').toDate();
        const fourthDate = moment(firstDate)
          .subtract(2, 'day').toDate();

        return BACKDOOR_ACTIONS.SCENARIO.prepareNamespace(
          DATA_PROVIDER_URL,
          BACKDOOR_USERNAME,
          BACKDOOR_PASSWORD,
          'testnamespace',
          {  username: 'testuser'},
          [
            {  username: 'atestuser1'},
            {  username: 'btestuser2'},
            {  username: 'ctestuser3'},
          ],
          [
            {
              user: 'testuser',
              record: {
                benefitors: [
                  'atestuser1',
                  'btestuser2',
                  'ctestuser3',
                ],
                cost: 4,
                currency: 'SIT',
                paidBy: ['testuser'],
                created: firstDate,
                edited: firstDate,
              },
            },
            {
              user: 'testuser',
              record: {
                benefitors: [
                  'atestuser1',
                  'btestuser2',
                  'ctestuser3',
                ],
                cost: 10,
                currency: 'SIT',
                paidBy: ['testuser'],
                created: secondDate,
                edited: secondDate,
              },
            },
            {
              user: 'testuser',
              record: {
                benefitors: [
                  'atestuser1',
                  'btestuser2',
                  'ctestuser3',
                ],
                cost: 5.4,
                currency: 'SIT',
                paidBy: ['testuser'],
                created: thirdDate,
                edited: thirdDate,
              },
            },
            {
              user: 'testuser',
              record: {
                benefitors: [
                  'atestuser1',
                  'btestuser2',
                  'ctestuser3',
                ],
                cost: 3,
                currency: 'SIT',
                paidBy: ['testuser'],
                created: fourthDate,
                edited: fourthDate,
              },
            },
          ],
        );
      },
      2: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        moment: any,
        DATA_PROVIDER_URL: string,
        BACKDOOR_USERNAME: string,
        BACKDOOR_PASSWORD: string,
      ) => {
        return BACKDOOR_ACTIONS.SCENARIO.prepareNamespace(
          DATA_PROVIDER_URL,
          BACKDOOR_USERNAME,
          BACKDOOR_PASSWORD,
          'testnamespace',
          {  username: 'testuser'},
          [
            {  username: 'Jože Testnik'},
          ],
        );
      },
    },
  },
};
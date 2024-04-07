import { Invitation, MNamespace, Owner, Record, RecordDataCy } from '@angular-monorepo/entities';
import axios from 'axios';

export function getRandomColor () {
  return '#000000'.replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
}

export const BACKDOOR_ACTIONS = {
  query: async (
    DATA_PROVIDER_URL: string,
    sql: string,
  ) => {
    const res = await  axios.post<Owner>(
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
        avatarImage: null,
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
    ownerKey: string,
    namespaceId: number,
    email: string,
  ) => {
    const res = await axios.post<Invitation>(
      `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
      {
        email,
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
};
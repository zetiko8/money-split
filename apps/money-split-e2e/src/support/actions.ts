import { TestOwner } from '@angular-monorepo/backdoor';
import { Invitation, MNamespace, Owner, Record, RecordDataCy } from '@angular-monorepo/entities';
import { ENV } from './config';

export function getRandomColor () {
  return '#000000'.replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
}

export const ACTIONS = {
  registerOwner: (
    username: string,
    password: string,
  ) => {
    return cy.request<Owner>({
      url: `${ENV().DATA_PROVIDER_URL}/app/register`,
      body: {
        username,
        password,
        avatarColor: getRandomColor(),
        avatarImage: null,
      },
      method: 'POST',
    }).then(res => res.body);
  },
  deleteOwner: (
    username: string,
  ) => {
    cy.request(
      'DELETE',
      `${ENV().DATA_PROVIDER_URL}/cybackdoor/owner/${username}`,
    ).then((response) => {
      expect(response.status).to.equal(200);
    });
  },
  deleteUser: (
    username: string,
  ) => {
    cy.request(
      'DELETE',
      `${ENV().DATA_PROVIDER_URL}/cybackdoor/user/${username}`,
    ).then((response) => {
      expect(response.status).to.equal(200);
    });
  },
  login: (
    username: string,
    password: string,
  ) => {
    return cy.request<{ token: string }>({
      url: `${ENV().DATA_PROVIDER_URL}/app/login`,
      body: {
        username,
        password,
      },
      method: 'POST',
    }).then(res => {
      cy.window().then(win => {
        win.localStorage.setItem('token', res.body.token);
      });
    });
  },
  loginTestOwner: async (
    testOwner: TestOwner,
  ) => {
    const token = await testOwner.login();
    cy.window().then(win => {
      win.localStorage.setItem('token', token);
    });
  },
  loginTestOwnerWithToken: (
    token: string,
  ) => {
    cy.visit('');
    cy.window().then(win => {
      win.localStorage.setItem('token', token);
    });
  },
  logout () {
    cy.window().then(win => {
      win.localStorage.removeItem('token');
    });
  },
  createNamespace (
    name: string,
    ownerKey: string,
  ) {
    return cy.request<MNamespace>({
      url: `${ENV().DATA_PROVIDER_URL}/cybackdoor/${ownerKey}/namespace`,
      body: {
        name,
      },
      method: 'POST',
    }).then(res => res.body);
  },
  deleteNamespace (
    namespaceId: number,
  ) {
    return cy.request<MNamespace>({
      url: `${ENV().DATA_PROVIDER_URL}/cybackdoor/namespace/${namespaceId}`,
      method: 'DELETE',
    }).then(res => res.body);
  },
  deleteNamespaceByName (
    namespaceName: string,
  ) {
    return cy.request<MNamespace>({
      url: `${ENV().DATA_PROVIDER_URL}/cybackdoor/namespaceName/${namespaceName}`,
      method: 'DELETE',
    }).then(res => res.body);
  },
  deleteInvitation (
    email: string,
  ) {
    return cy.request<Invitation>({
      url: `${ENV().DATA_PROVIDER_URL}/cybackdoor/invitation/${email}`,
      method: 'DELETE',
    }).then(res => res.body);
  },
  createInvitation (
    email: string,
  ) {
    return cy.request<Invitation>({
      url: `${ENV().DATA_PROVIDER_URL}/cybackdoor/invitation/${email}`,
      method: 'DELETE',
    }).then(res => res.body);
  },
  invite (
    ownerKey: string,
    namespaceId: number,
    email: string,
  ) {
    return cy.request<Invitation>({
      url: `${ENV().DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}/invite`,
      method: 'POST',
      body: { email },
    }).then(res => res.body);
  },
  acceptInvitation (
    ownerUsername: string,
    name: string,
    email: string,
  ) {
    return cy.request<Invitation>({
      url: `${ENV().DATA_PROVIDER_URL}/cybackdoor/invitation/accept`,
      method: 'POST',
      body: { email, name, ownerUsername },
    }).then(res => res.body);
  },
  addRecord (
    namespaceName: string,
    createdBy: string,
    record: RecordDataCy,
  ) {
    return cy.request<Record>({
      url: `${ENV().DATA_PROVIDER_URL}/cybackdoor/record/${namespaceName}/${createdBy}`,
      method: 'POST',
      body: record,
    }).then(res => res.body);
  },
  settleRecords (
    namespaceName: string,
    byUsername: string,
    records: number[],
    settledOn: Date,
  ) {
    return cy.request<Invitation>({
      url: `${ENV().DATA_PROVIDER_URL}/cybackdoor/settle/${namespaceName}/${byUsername}`,
      method: 'POST',
      body: { records, settledOn },
    }).then(res => res.body);
  },
};
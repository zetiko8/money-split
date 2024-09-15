import { DATA_PROVIDER_API } from '@angular-monorepo/api-interface';
import { Invitation, MNamespace, NamespaceView, Owner } from '@angular-monorepo/entities';
import axios from 'axios';
import { BACKDOOR_ACTIONS, getRandomColor } from './backdoor-actions';

export class TestOwner {

  public owner!: Owner;
  public token!: string;
  public invitations: Invitation[] = [];

  constructor (
    private readonly DATA_PROVIDER_URL: string,
    private readonly username: string,
    private readonly password: string,
  ) {}

  async register () {
    const res = await  axios.post<Owner>(
      this.DATA_PROVIDER_URL + '/app/register',
      {
        username: this.username,
        password: this.password,
        avatarColor: getRandomColor(),
        avatarUrl: null,
      },
    );

    this.owner = res.data;
    await this.login();
  }

  async login () {
    const res = await  axios.post<{ token: string }>(
      this.DATA_PROVIDER_URL + '/app/login',
      {
        username: this.owner.username,
        password: this.password,
      },
    );

    this.token = res.data.token;
  }

  async createNamespace (
    namespaceName: string,
  ) {
    const res = await axios.post<MNamespace>(
      `${this.DATA_PROVIDER_URL}/app/${this.owner.key}/namespace`,
      {
        namespaceName,
        avatarColor: getRandomColor(),
        avatarUrl: null,
      },
      this.authHeaders(),
    );

    return res.data;
  }

  getNamespaces () {
    return DATA_PROVIDER_API.getNamespaceApi.callPromise(
      null,
      { ownerKey: this.owner.key },
      async (endpoint) => {
        const res = await axios.get<MNamespace[]>(
          `${this.DATA_PROVIDER_URL}/app/${endpoint}`,
          this.authHeaders(),
        );
        return res.data;
      },
    );
  }

  acceptInvitation (
    name: string,
    invitationKey: string,
  ) {
    return DATA_PROVIDER_API.acceptInvitationApi.callPromise(
      { name },
      { invitationKey },
      async (endpoint, method, payload) => {
        const res = await axios.post<Invitation>(
          `${this.DATA_PROVIDER_URL}/app/${endpoint}`,
          payload,
          this.authHeaders(),
        );
        return res.data;
      },
    );
  }

  async inviteToNamespace (
    email: string,
    namespaceId: number,
  ) {
    const invitation = await DATA_PROVIDER_API
      .createInvitationApi.callPromise(
        { email },
        { namespaceId, ownerKey: this.owner.key },
        async (endpoint, method, payload) => {
          const res = await axios.post<Invitation>(
            `${this.DATA_PROVIDER_URL}/app/${endpoint}`,
            payload,
            this.authHeaders(),
          );
          return res.data;
        },
      );

    this.invitations.push(invitation);
    return invitation;
  }

  async getUserForNamespace (
    namespaceId: number,
  ) {
    const namespace
      = await DATA_PROVIDER_API.getNamespaceViewApi.callPromise(
        null,
        { namespaceId, ownerKey: this.owner.key },
        async (endpoint) => {
          const res = await axios.get<NamespaceView>(
            `${this.DATA_PROVIDER_URL}/app/${endpoint}`,
            this.authHeaders(),
          );
          return res.data;
        },
      );

    const user = namespace.users.find(u => u.ownerId === this.owner.id);
    if (!user) throw Error('Test owner - user not found');
    return user;
  }

  authHeaders () {
    return {
      headers: {
        'Authorization': 'Bearer ' + this.token,
      },
    };
  }

  async dispose () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const owner: any = await BACKDOOR_ACTIONS.query(
      this.DATA_PROVIDER_URL,
      `
      SELECT * FROM \`Owner\`
      WHERE \`username\` = '${this.username}' 
      `,
    );

    if (!owner || !owner.length) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ownerId = (owner as any)[0].id as number;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const namespaces: any = await BACKDOOR_ACTIONS.query(
      this.DATA_PROVIDER_URL,
      `
      SELECT * FROM \`NamespaceOwner\`
      WHERE \`ownerId\` = ${ownerId} 
      `,
    );

    if (namespaces && namespaces.length) {
      for (const ns of namespaces) {


        await BACKDOOR_ACTIONS.query(
          this.DATA_PROVIDER_URL,
          `
          DELETE FROM \`NamespaceOwner\`
          WHERE \`ownerId\` = ${ownerId}
          OR \`namespaceId\` = ${ns.namespaceId}
          `,
        );

        await BACKDOOR_ACTIONS.query(
          this.DATA_PROVIDER_URL,
          `
          DELETE FROM \`Invitation\`
          WHERE \`namespaceId\` = ${ns.namespaceId}
          `,
        );

        await BACKDOOR_ACTIONS.query(
          this.DATA_PROVIDER_URL,
          `
          DELETE FROM \`Record\`
          WHERE \`namespaceId\` = ${ns.namespaceId}
          `,
        );

        await BACKDOOR_ACTIONS.query(
          this.DATA_PROVIDER_URL,
          `
          DELETE FROM \`Settlement\`
          WHERE \`namespaceId\` = ${ns.namespaceId}
          `,
        );

        await BACKDOOR_ACTIONS.query(
          this.DATA_PROVIDER_URL,
          `
          DELETE FROM \`SettlementDebt\`
          WHERE \`namespaceId\` = ${ns.namespaceId}
          `,
        );

        await BACKDOOR_ACTIONS.query(
          this.DATA_PROVIDER_URL,
          `
          DELETE FROM \`User\`
          WHERE \`namespaceId\` = ${ns.namespaceId}
          `,
        );

        await BACKDOOR_ACTIONS.query(
          this.DATA_PROVIDER_URL,
          `
          DELETE FROM \`Namespace\`
          WHERE \`id\` = ${ns.namespaceId}
          `,
        );
      }
    };

    await BACKDOOR_ACTIONS.query(
      this.DATA_PROVIDER_URL,
      `
      DELETE FROM \`Owner\`
      WHERE \`id\` = ${ownerId}
      `,
    );
  }
}
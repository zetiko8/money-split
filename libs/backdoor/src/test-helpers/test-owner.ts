import { DATA_PROVIDER_API } from '@angular-monorepo/api-interface';
import { Invitation, MNamespace, NamespaceView, Owner, Record, RecordDataBackdoor } from '@angular-monorepo/entities';
import axios from 'axios';
import { BACKDOOR_ACTIONS, getRandomColor } from './backdoor-actions';

export class TestOwner {

  public owner!: Owner;
  public token!: string;
  public backdoorToken!: string;
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

    return this.token;
  }

  async backdoorLogin (credentials: {
    username: string;
    password: string;
  }) {
    const res = await  axios.post<{ token: string }>(
      this.DATA_PROVIDER_URL + '/app/login',
      {
        username: credentials.username,
        password: credentials.password,
      },
    );

    this.backdoorToken = res.data.token;

    return this.backdoorToken;
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

  backdoorAuthHeaders () {
    return {
      headers: {
        'Authorization': 'Bearer ' + this.backdoorToken,
      },
    };
  }

  async addOwnerToNamespace (
    namespaceId: number,
    ownerToAddData: {
      email?: string,
      name: string,
      password?: string,
    },
  ) {
    const email = ownerToAddData.email || (ownerToAddData.name + '@test.com');
    const pwd = ownerToAddData.password || 'testpassword';
    const invitation =
    await this.inviteToNamespace(email, namespaceId);
    const owner = new TestOwner(
      this.DATA_PROVIDER_URL,
      ownerToAddData.name,
      pwd,
    );
    await owner.dispose();
    await owner.register();
    await owner.acceptInvitation(ownerToAddData.name, invitation.invitationKey);

    return owner;
  }

  async addRecordToNamespace (
    namespaceId: number,
    record: RecordDataBackdoor,
  ) {
    const result
    = await DATA_PROVIDER_API.addRecordApiBackdoor.callPromise(
      record,
      { namespaceId },
      async (endpoint, method, payload) => {
        const res = await axios.post<Record>(
          `${this.DATA_PROVIDER_URL}/app/${endpoint}`,
          payload,
          this.backdoorAuthHeaders(),
        );
        return res.data;
      },
    );

    return result;
  }

  async dispose () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ownerArr: any = await BACKDOOR_ACTIONS.query(
      this.DATA_PROVIDER_URL,
      `
      SELECT * FROM \`Owner\`
      WHERE \`username\` = '${this.username}' 
      `,
    );

    if (!ownerArr || !ownerArr.length) return;

    const owner = (ownerArr as unknown as Owner[])[0] as Owner;
    const ownerId = owner.id;

    await BACKDOOR_ACTIONS.query(
      this.DATA_PROVIDER_URL,
      `
      call testDispose(${ownerId})
      `,
    );

    return;
  }
}

import { DATA_PROVIDER_API } from '@angular-monorepo/api-interface';
import { AvatarData, BackdoorLoadData, CreatePaymentEventData, Invitation, MNamespace, NamespaceView, Owner, PaymentEvent, Record, RecordDataBackdoor, SettlementPayloadBackdoor } from '@angular-monorepo/entities';
import axios from 'axios';
import { getRandomColor } from './backdoor-actions';

export class TestOwner {

  public owner!: Owner;
  public token!: string;
  public backdoorToken!: string;
  public invitations: Invitation[] = [];

  constructor (
    private readonly DATA_PROVIDER_URL: string,
    public readonly username: string,
    public readonly password: string,
  ) {}

  public static async fromUserNameAndPassword (
    DATA_PROVIDER_URL: string,
    BACKDOOR_USERNAME: string,
    BACKDOOR_PASSWORD: string,
    username: string,
    password: string,
  ): Promise<TestOwner> {
    const backdoorToken = await TestOwner.sBackdoorLogin(DATA_PROVIDER_URL, { username: BACKDOOR_USERNAME, password: BACKDOOR_PASSWORD });
    const te = new TestOwner(DATA_PROVIDER_URL, username, password);
    const owner = await TestOwner.getOwnerDataByUsername(DATA_PROVIDER_URL, backdoorToken, username);
    if (!owner) throw new Error('fromUserNameAndPassword: Owner not found');
    te.owner = owner;
    return te;
  }

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
    this.token
      = await TestOwner
        .sLogin(this.DATA_PROVIDER_URL, this.username, this.password);

    return this.token;
  }

  static async sLogin (
    DATA_PROVIDER_URL: string,
    username: string,
    password: string,
  ) {
    const res = await  axios.post<{ token: string }>(
      DATA_PROVIDER_URL + '/app/login',
      {
        username,
        password,
      },
    );

    return res.data.token;
  }

  async backdoorLogin (credentials: {
    username: string;
    password: string;
  }) {
    this.backdoorToken
      = await TestOwner.sBackdoorLogin(this.DATA_PROVIDER_URL, credentials);
  }

  static async sBackdoorLogin (
    DATA_PROVIDER_URL: string,
    credentials: {
    username: string;
    password: string;
  }) {
    const res = await  axios.post<{ token: string }>(
      DATA_PROVIDER_URL + '/app/login',
      {
        username: credentials.username,
        password: credentials.password,
      },
    );

    return res.data.token;
  }

  async createNamespace (
    namespaceName: string,
  ) {
    return TestOwner.sCreateNamespace(
      this.DATA_PROVIDER_URL,
      this.owner.key,
      namespaceName,
      this.token,
    );
  }

  static async sCreateNamespace (
    DATA_PROVIDER_URL: string,
    ownerKey: string,
    namespaceName: string,
    token: string,
  ) {
    const res = await axios.post<MNamespace>(
      `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace`,
      {
        namespaceName,
        avatarColor: getRandomColor(),
        avatarUrl: null,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      },
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

  getNamespace (namespaceId: number) {
    return DATA_PROVIDER_API.getNamespaceViewApi.callPromise(
      null,
      { ownerKey: this.owner.key, namespaceId },
      async (endpoint) => {
        const res = await axios.get<NamespaceView>(
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
    return TestOwner.sAcceptInvitation(
      this.DATA_PROVIDER_URL,
      name,
      invitationKey,
      this.token,
    );
  }

  static async sAcceptInvitation (
    DATA_PROVIDER_URL: string,
    name: string,
    invitationKey: string,
    token: string,
  ) {
    return DATA_PROVIDER_API.acceptInvitationApi.callPromise(
      { name },
      { invitationKey },
      async (endpoint, method, payload) => {
        const res = await axios.post<Invitation>(
          `${DATA_PROVIDER_URL}/app/${endpoint}`,
          payload,
          {
            headers: {
              'Authorization': 'Bearer ' + token,
            },
          },
        );
        return res.data;
      },
    );
  }

  async inviteToNamespace (
    email: string,
    namespaceId: number,
  ) {
    const invitation = await TestOwner.sInviteToNamespace(
      this.DATA_PROVIDER_URL,
      this.owner.key,
      email,
      namespaceId,
      this.token,
    );

    this.invitations.push(invitation);
    return invitation;
  }

  static async sInviteToNamespace (
    DATA_PROVIDER_URL: string,
    ownerKey: string,
    email: string,
    namespaceId: number,
    token: string,
  ) {
    const invitation = await DATA_PROVIDER_API
      .createInvitationApi.callPromise(
        { email },
        { namespaceId, ownerKey },
        async (endpoint, method, payload) => {
          const res = await axios.post<Invitation>(
            `${DATA_PROVIDER_URL}/app/${endpoint}`,
            payload,
            {
              headers: {
                'Authorization': 'Bearer ' + token,
              },
            },
          );
          return res.data;
        },
      );

    return invitation;
  }

  async getUserForNamespace (
    namespaceId: number,
  ) {
    const namespaceView
      = await this.getNamespace(namespaceId);

    const user = namespaceView.users.find(u => u.ownerId === this.owner.id);
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

  static sBackdoorAuthHeaders (backdoorToken: string) {
    return {
      headers: {
        'Authorization': 'Bearer ' + backdoorToken,
      },
    };
  }

  async addOwnerToNamespace (
    BACKDOOR_USERNAME: string,
    BACKDOOR_PASSWORD: string,
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
    await TestOwner.dispose(this.DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, ownerToAddData.name);
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

  async addPaymentEventToNamespace (
    namespaceId: number,
    userId: number,
    record: CreatePaymentEventData,
  ) {
    const result
    = await DATA_PROVIDER_API.addPaymentEventApi.callPromise(
      record,
      { namespaceId, ownerKey: this.owner.key, userId },
      async (endpoint, method, payload) => {
        const res = await axios.post<PaymentEvent>(
          `${this.DATA_PROVIDER_URL}/app/${endpoint}`,
          payload,
          this.authHeaders(),
        );
        return res.data;
      },
    );

    return result;
  }

  async addPaymentEventToNamespaceBackdoor (
    record: PaymentEvent,
  ) {
    const result
    = await DATA_PROVIDER_API.addPaymentEventApiBackdoor.callPromise(
      record,
      null,
      async (endpoint, method, payload) => {
        const res = await axios.post<PaymentEvent>(
          `${this.DATA_PROVIDER_URL}/app/${endpoint}`,
          payload,
          this.backdoorAuthHeaders(),
        );
        return res.data;
      },
    );

    return result;
  }

  static async sAddPaymentEventToNamespaceBackdoor (
    DATA_PROVIDER_URL: string,
    record: PaymentEvent,
    backdoorToken: string,
  ) {
    const result
    = await DATA_PROVIDER_API.addPaymentEventApiBackdoor.callPromise(
      record,
      null,
      async (endpoint, method, payload) => {
        const res = await axios.post<PaymentEvent>(
          `${DATA_PROVIDER_URL}/app/${endpoint}`,
          payload,
          TestOwner.sBackdoorAuthHeaders(backdoorToken),
        );
        return res.data;
      },
    );

    return result;
  }

  static async settleConfirmBackdoor (
    DATA_PROVIDER_URL: string,
    record: SettlementPayloadBackdoor,
    backdoorToken: string,
  ) {
    const result
    = await DATA_PROVIDER_API.settleConfirmApiBackdoor.callPromise(
      record,
      null,
      async (endpoint, method, payload) => {
        const res = await axios.post<PaymentEvent>(
          `${DATA_PROVIDER_URL}/app/${endpoint}`,
          payload,
          TestOwner.sBackdoorAuthHeaders(backdoorToken),
        );
        return res.data;
      },
    );

    return result;
  }

  async getAvatar (
    avatarId: number,
  ) {
    const result
    = await DATA_PROVIDER_API.getAvatarApi.callPromise(
      null,
      { avatarId },
      async (endpoint) => {
        const res = await axios.get<AvatarData>(
          `${this.DATA_PROVIDER_URL}/app/${endpoint}`,
          this.backdoorAuthHeaders(),
        );
        return res.data;
      },
    );

    return result;
  }

  private static async getOwnerDataByUsername (
    DATA_PROVIDER_URL: string,
    backdoorToken: string,
    username: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ownerArr: any = await TestOwner.query(
      DATA_PROVIDER_URL,
      backdoorToken,
      `
          SELECT * FROM \`Owner\`
          WHERE \`username\` = '${username}' 
          `,
    );

    if (!ownerArr || !ownerArr.length) return;

    const owner = (ownerArr as unknown as Owner[])[0] as Owner;
    return owner;
  }

  public static async dispose (
    DATA_PROVIDER_URL: string,
    BACKDOOR_USERNAME: string,
    BACKDOOR_PASSWORD: string,
    username: string,
  ) {
    const backdoorToken = await TestOwner.sBackdoorLogin(
      DATA_PROVIDER_URL,
      {
        username: BACKDOOR_USERNAME,
        password: BACKDOOR_PASSWORD,
      });
    const owner = await this.getOwnerDataByUsername(DATA_PROVIDER_URL, backdoorToken, username);
    if (!owner) return;
    await TestOwner.query(
      DATA_PROVIDER_URL,
      backdoorToken,
      `
      call testDispose(${owner.id})
      `,
    );

    return;
  }

  static async load (
    DATA_PROVIDER_URL: string,
    backdoorToken: string,
    ownerIds: number[],
  ) {
    const result
    = await DATA_PROVIDER_API.loadApiBackdoor.callPromise(
      ownerIds,
      null,
      async (endpoint, method, payload) => {
        const res = await axios.post<BackdoorLoadData[]>(
          `${DATA_PROVIDER_URL}/cybackdoor${endpoint}`,
          payload,
          this.sBackdoorAuthHeaders(backdoorToken),
        );
        return res.data;
      },
    );

    return result;
  }

  static async query (
    DATA_PROVIDER_URL: string,
    backdoorToken: string,
    sql: string,
  ) {
    const result
    = await DATA_PROVIDER_API.sqlBackdoor.callPromise(
      { sql },
      null,
      async (endpoint, method, payload) => {
        const res = await axios.post<unknown>(
          `${DATA_PROVIDER_URL}/cybackdoor${endpoint}`,
          payload,
          this.sBackdoorAuthHeaders(backdoorToken),
        );
        return res.data;
      },
    );

    return result;
  }
}

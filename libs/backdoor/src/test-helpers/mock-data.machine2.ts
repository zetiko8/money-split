import { MemoryStorage } from './mock-data.machine';
import { TestOwner } from './test-owner';
import {
  PaymentEvent,
  BackdoorLoadData,
  CreatePaymentEventDataBackdoor,
  NamespaceView,
  Owner,
  User,
  SettlementPayloadBackdoor,
  SettlementPayload,
  BackdoorScenarioData,
} from '@angular-monorepo/entities';

export interface OwnerData {
  ownerId: number,
  password: string,
  data: BackdoorLoadData
}

class MockDataMachine2Internal {
  private defaultPassword = 'testPaswword';
  private currentProfile = 'default';
  private readonly STORAGE_PREFIX = 'mock-data-';
  private readonly LAST_PROFILE_KEY = 'mock-data-last-profile';
  private backdoorToken: string | null = null;

  private state: OwnerData[] = [];

  constructor(
    private readonly dataProviderUrl: string,
    private readonly BACKDOOR_USERNAME: string,
    private readonly BACKDOOR_PASSWORD: string,
    private storage: Storage = new MemoryStorage(),
  ) {
    this.dataProviderUrl = dataProviderUrl;
  }

  async createOwner (username: string, password?: string) {
    await TestOwner.dispose(this.dataProviderUrl, this.BACKDOOR_USERNAME, this.BACKDOOR_PASSWORD, username);
    const owner = new TestOwner(this.dataProviderUrl, username, password || this.defaultPassword);
    await owner.register();
    this.save([
      ...this.state.map(s => {
        return {
          username: s.data.owner.username,
          password: s.password,
          id: s.ownerId,
        };
      }),
      {
        username,
        password: password || this.defaultPassword,
        id: owner.owner.id,
      },
    ]);
    await this.load();

    return owner.owner;
  }

  async createNamespace (ownerName: string, namespaceName: string) {
    const owner = this.getOwnerByUsername(ownerName);
    if (!owner) throw new Error('Owner not found');
    const token = await this.loginOwner(ownerName);
    const namespace = await TestOwner.sCreateNamespace(
      this.dataProviderUrl,
      owner.data.owner.key,
      namespaceName,
      token,
    );

    await this.load();
    return namespace;
  }

  async inviteToNamespace (
    ownerName: string,
    namespaceName: string,
    email: string,
  ) {
    const owner = this.getOwnerByUsername(ownerName);
    if (!owner) throw new Error('Owner not found');
    const token = await this.loginOwner(ownerName);
    const namespace
      = this.state.find(s => s.data.owner.username === ownerName)?.data.namespaces
        .find(n => n.name === namespaceName);
    if (!namespace) throw new Error('Namespace not found');
    const invitation = await TestOwner.sInviteToNamespace(
      this.dataProviderUrl,
      owner.data.owner.key,
      email,
      namespace.id,
      token,
    );

    await this.load();
    return invitation;
  }

  async acceptInvitation (
    ownerName: string,
    namespaceName: string,
    invitedEmail: string,
    namespaceUserUserName: string,
  ) {
    try {
      const owner = this.getOwnerByUsername(ownerName);
      if (!owner) throw new Error('Owner not found');
      const token = await this.loginOwner(ownerName);
      const allNamespaces: NamespaceView[] = [];
      this.state.forEach(s => {
        allNamespaces.push(...s.data.namespaces);
      });
      const namespace
      = allNamespaces
        .find(n => n.name === namespaceName);
      if (!namespace) throw new Error('Namespace not found');
      const invitation = namespace.invitations.find(i => i.email === invitedEmail);
      if (!invitation) throw new Error('Invitation not found');
      const invitationKey = invitation.invitationKey;
      const res = await TestOwner.sAcceptInvitation(
        this.dataProviderUrl,
        namespaceUserUserName,
        invitationKey,
        token,
      );

      await this.load();
      return res;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      if (err.message) {
        console.error('Error: MockDataMachine2.load: ' + err.message);
        throw new Error(err.message);
      }
      else throw error;
    }
  }

  async addPaymentEvent (
    ownerName: string,
    namespaceName: string,
    user: string,
    paymentEvent: CreatePaymentEventDataBackdoor,
  ) {
    const owner = this.getOwnerByUsername(ownerName);
    if (!owner) throw new Error('Owner not found');
    const namespace
      = this.state.find(s => s.data.owner.username === ownerName)?.data.namespaces
        .find(n => n.name === namespaceName);
    if (!namespace) throw new Error('Namespace not found');
    const userId = namespace.users.find(u => u.name === user)?.id;
    if (!userId) throw new Error('User not found');

    const record: PaymentEvent = {
      id: 0,
      created: paymentEvent.created,
      edited: paymentEvent.edited,
      createdBy: userId,
      editedBy: userId,
      benefitors: paymentEvent.benefitors.map(b => ({
        userId: (namespace.users.find(u => u.name === b.user)?.id) as number,
        amount: b.amount,
        currency: b.currency,
      })),
      paidBy: paymentEvent.paidBy.map(p => ({
        userId: (namespace.users.find(u => u.name === p.user)?.id) as number,
        amount: p.amount,
        currency: p.currency,
      })),
      namespaceId: namespace.id,
      settlementId: null,
      description: paymentEvent.description,
      notes: paymentEvent.notes,
    };
    const res = await TestOwner.sAddPaymentEventToNamespaceBackdoor(
      this.dataProviderUrl,
      record,
      await this.getBackdoorToken(),
    );

    await this.load();
    return res;
  }

  async settleRecords (
    ownerName: string,
    namespaceName: string,
    user: string,
    settlementPayload: SettlementPayload,
    settledOn: Date,
  ) {
    const owner = this.getOwnerByUsername(ownerName);
    if (!owner) throw new Error('Owner not found');
    const namespace
      = this.state.find(s => s.data.owner.username === ownerName)?.data.namespaces
        .find(n => n.name === namespaceName);
    if (!namespace) throw new Error('Namespace not found');
    const userId = namespace.users.find(u => u.name === user)?.id;
    if (!userId) throw new Error('User not found');

    const payload: SettlementPayloadBackdoor = {
      separatedSettlementPerCurrency: settlementPayload.separatedSettlementPerCurrency,
      currencies: settlementPayload.currencies,
      mainCurrency: settlementPayload.mainCurrency,
      paymentEvents: settlementPayload.paymentEvents,
      settledOn,
      userId,
      namespaceId: namespace.id,
      ownerId: owner.data.owner.id,
    };
    const res = await TestOwner.settleConfirmBackdoor(
      this.dataProviderUrl,
      payload,
      await this.getBackdoorToken(),
    );

    await this.load();
    return res;
  }

  public save(
    owners: { username: string; password: string; id: number }[])
    : void {
    this.storage.setItem(this.getStorageKey('testOwner'), JSON.stringify(owners));
  }

  private readLsData () {
    const lsData = this.storage.getItem(this.getStorageKey('testOwner'));
    if (!lsData) {
      return;
    }

    return JSON.parse(lsData) as unknown as { username: string; password: string; id: number }[];
  }

  private mapToState (
    backdoorLoadData: BackdoorLoadData[],
    data: { username: string; password: string; id: number }[],
  ) {
    return backdoorLoadData.map((d) => ({
      ownerId: d.owner.id,
      password: data
        .find((dp) => dp.id === d.owner.id)?.password
        || this.defaultPassword,
      data: d,
    }));
  }

  private async load(): Promise<void> {
    try {

      const data = this.readLsData();
      if (!data) {
        this.state = [];
        return;
      }
      const res = await TestOwner.load(
        this.dataProviderUrl,
        await this.getBackdoorToken(),
        data.map((d) => d.id),
      );
      this.state = this.mapToState(res, data);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      if (err.message) {
        console.error('Error: MockDataMachine2.load: ' + err.message);
        throw new Error(err.message);
      }
      else throw error;
    }
  }

  public setState(backdoorLoadData: BackdoorLoadData[]): void {
    const data = this.readLsData();
    if (!data) {
      this.state = [];
      return;
    }

    this.state = this.mapToState(backdoorLoadData, data);
  }

  private getStorageKey(key: string): string {
    return this.STORAGE_PREFIX + key + '-' + this.currentProfile;
  }

  private getOwnerByUsername (username: string): OwnerData | null {
    return this.state.find((o) => o.data.owner.username === username) || null;
  }

  public getOwner (username: string): Owner {
    return this.getOwnerByUsername(username)?.data.owner as Owner;
  }

  public getNamespace (namespaceName: string): NamespaceView {
    const allNamespaces: NamespaceView[] = [];
    this.state.forEach(s => {
      allNamespaces.push(...s.data.namespaces);
    });
    const namespace
    = allNamespaces
      .find(n => n.name === namespaceName);
    if (!namespace) throw new Error('Namespace not found');
    return namespace;
  }

  public getNamespaceUser (namespaceName: string, namespaceUserUsername: string): User {
    const allNamespaces: NamespaceView[] = [];
    this.state.forEach(s => {
      allNamespaces.push(...s.data.namespaces);
    });
    const namespace
    = allNamespaces
      .find(n => n.name === namespaceName);
    if (!namespace) throw new Error('Namespace not found');
    const user = namespace.users.find(u => u.name === namespaceUserUsername);
    if (!user) throw new Error('Namespace user not found');
    return user;
  }

  public getNamespacePaymentEventIds (namespaceName: string): number[] {
    const allNamespaces: NamespaceView[] = [];
    this.state.forEach(s => {
      allNamespaces.push(...s.data.namespaces);
    });
    const namespace
    = allNamespaces
      .find(n => n.name === namespaceName);
    if (!namespace) throw new Error('Namespace not found');
    return namespace.paymentEvents.map(pe => pe.id);
  }

  public loginOwner (ownerName: string): Promise<string> {
    const owner = this.getOwnerByUsername(ownerName);
    if (!owner) throw new Error('Owner not found');
    return TestOwner.sLogin(
      this.dataProviderUrl,
      owner.data.owner.username,
      owner.password,
    );
  }

  public async getAuthHeaders (
    ownerName: string,
  ): Promise<{ headers: { Authorization: string } }> {
    return {
      headers: {
        'Authorization': 'Bearer ' + (await this.loginOwner(ownerName)),
      },
    };
  }

  private async getBackdoorToken (): Promise<string> {
    if (!this.backdoorToken)
      this.backdoorToken = await TestOwner.sBackdoorLogin(
        this.dataProviderUrl,
        {
          username: this.BACKDOOR_USERNAME,
          password: this.BACKDOOR_PASSWORD,
        },
      );
    return this.backdoorToken;
  }
}

export class MockDataMachine2 {
  private mockDataMachine2Internal: MockDataMachine2Internal;

  constructor(
    dataProviderUrl: string,
    BACKDOOR_USERNAME: string,
    BACKDOOR_PASSWORD: string,
    mockDataMachine2Internal?: MockDataMachine2Internal,
  ) {
    if (mockDataMachine2Internal) {
      this.mockDataMachine2Internal = mockDataMachine2Internal;
      return;
    } else {
      this.mockDataMachine2Internal = new MockDataMachine2Internal(
        dataProviderUrl,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
      );
    }
  }

  async createOwner (username: string, password?: string) {
    return this.mockDataMachine2Internal
      .createOwner(username, password);
  }

  async createNamespace (ownerName: string, namespaceName: string) {
    return this.mockDataMachine2Internal
      .createNamespace(ownerName, namespaceName);
  }

  async inviteToNamespace (
    ownerName: string,
    namespaceName: string,
    email: string,
  ) {
    return this.mockDataMachine2Internal
      .inviteToNamespace(ownerName, namespaceName, email);
  }

  async acceptInvitation (
    ownerName: string,
    namespaceName: string,
    invitedEmail: string,
    namespaceUserUserName: string,
  ) {
    return this.mockDataMachine2Internal
      .acceptInvitation(ownerName, namespaceName, invitedEmail, namespaceUserUserName);
  }

  async addPaymentEvent (
    ownerName: string,
    namespaceName: string,
    user: string,
    paymentEvent: CreatePaymentEventDataBackdoor,
  ) {
    return this.mockDataMachine2Internal
      .addPaymentEvent(ownerName, namespaceName, user, paymentEvent);
  }

  async settleRecords (
    ownerName: string,
    namespaceName: string,
    user: string,
    settlementPayload: SettlementPayload,
    settledOn: Date,
  ) {
    return this.mockDataMachine2Internal
      .settleRecords(ownerName, namespaceName, user, settlementPayload, settledOn);
  }

  public getOwner (username: string): Owner {
    return this.mockDataMachine2Internal
      .getOwner(username);
  }

  public getNamespace (namespaceName: string): NamespaceView {
    return this.mockDataMachine2Internal
      .getNamespace(namespaceName);
  }

  public getNamespaceUser (namespaceName: string, namespaceUserUsername: string): User {
    return this.mockDataMachine2Internal
      .getNamespaceUser(namespaceName, namespaceUserUsername);
  }

  public getNamespacePaymentEventIds (namespaceName: string): number[] {
    return this.mockDataMachine2Internal
      .getNamespacePaymentEventIds(namespaceName);
  }

  public loginOwner (ownerName: string): Promise<string> {
    return this.mockDataMachine2Internal
      .loginOwner(ownerName);
  }

  public async getAuthHeaders (
    ownerName: string,
  ): Promise<{ headers: { Authorization: string } }> {
    return this.mockDataMachine2Internal
      .getAuthHeaders(ownerName);
  }

  public static async createScenario (
    DATA_PROVIDER_URL: string,
    BACKDOOR_USERNAME: string,
    BACKDOOR_PASSWORD: string,
    backdoorScenarioData: BackdoorScenarioData,
  ): Promise<MockDataMachine2> {
    const backdoorToken = await TestOwner.sBackdoorLogin(DATA_PROVIDER_URL, { username: BACKDOOR_USERNAME, password: BACKDOOR_PASSWORD });
    const data = await TestOwner.createScenario(DATA_PROVIDER_URL, backdoorToken, backdoorScenarioData);
    const dmi = new MockDataMachine2Internal(DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

    const dm = new MockDataMachine2(
      DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD, dmi);
    dmi.save(backdoorScenarioData.owners.map((o) => ({
      username: o.name,
      password: o.password || 'testpassword',
      id: data.find((d) => d.owner.username === o.name)!.owner.id,
    })));
    dmi.setState(data);
    return dm;
  }
}

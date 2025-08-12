import { TestOwner } from './test-owner';
import { MNamespace, Invitation, NamespaceView, Owner } from '@angular-monorepo/entities';

export interface SerializedTestOwner {
  username: string;
  password: string;
  owner: Owner;
}

export interface MockDataState {
  clusters: TestOwner[];
  namespaces: MNamespace[];
  allInvitations: Invitation[];
  selectedTestOwner?: TestOwner;
  selectedNamespace?: NamespaceView;
  currentNamespaceInvitations: Invitation[];
}

export class MockDataMachine {
  private clusters: TestOwner[] = [];
  private namespaces: MNamespace[] = [];
  private allInvitations: Invitation[] = [];
  private selectedTestOwner?: TestOwner;
  private selectedNamespace?: NamespaceView;
  private dataProviderUrl: string;

  constructor(dataProviderUrl: string) {
    this.dataProviderUrl = dataProviderUrl;
  }

  async initialize(): Promise<MockDataState> {
    await this.load();
    return {
      clusters: this.clusters,
      namespaces: this.namespaces,
      allInvitations: this.allInvitations,
      selectedTestOwner: this.selectedTestOwner,
      selectedNamespace: this.selectedNamespace,
      currentNamespaceInvitations: this.loadInvitations(),
    };
  }

  private getState(): MockDataState {
    return {
      clusters: this.clusters,
      namespaces: this.namespaces,
      allInvitations: this.allInvitations,
      selectedTestOwner: this.selectedTestOwner,
      selectedNamespace: this.selectedNamespace,
      currentNamespaceInvitations: this.loadInvitations(),
    };
  }

  async createNewCluster(username: string, password: string): Promise<MockDataState> {
    try {
      const testOwner = new TestOwner(this.dataProviderUrl, username, password);
      await testOwner.register();
      this.clusters.push(testOwner);
      this.save();
      await this.selectCluster(testOwner);
      return this.getState();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async createNewNamespace(namespaceName: string): Promise<MockDataState> {
    try {
      if (!this.selectedTestOwner) throw new Error('No cluster selected');
      await this.selectedTestOwner.createNamespace(namespaceName);
      this.namespaces = await this.selectedTestOwner.getNamespaces();
      this.save();
      return this.getState();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async createNewInvitation(email: string): Promise<MockDataState> {
    try {
      if (!this.selectedTestOwner) throw new Error('No cluster selected');
      if (!this.selectedNamespace) throw new Error('No namespace selected');
      const invitation = await this.selectedTestOwner.inviteToNamespace(email, this.selectedNamespace.id);
      this.allInvitations.push(invitation);
      this.save();
      return this.getState();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async acceptInvitation(invitation: Invitation): Promise<MockDataState> {
    try {
      const testOwner = new TestOwner(this.dataProviderUrl, invitation.email, 'testpassword');
      await testOwner.register();
      await this.loginIfNeccessary(testOwner);
      await testOwner.acceptInvitation(invitation.email, invitation.invitationKey);
      invitation.accepted = true;
      this.save();
      await this.load();
      return this.getState();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async selectCluster(testOwner: TestOwner): Promise<MockDataState> {
    this.selectedTestOwner = testOwner;
    await this.loginIfNeccessary(testOwner);
    this.namespaces = await testOwner.getNamespaces();
    if (this.namespaces.length > 0) {
      await this.selectNamespace(this.namespaces[0]);
    }
    return this.getState();
  }

  async selectNamespace(namespace: MNamespace): Promise<MockDataState> {
    if (!this.selectedTestOwner) throw new Error('No cluster selected');
    this.selectedNamespace = await this.selectedTestOwner.getNamespace(namespace.id);
    this.loadInvitations();
    return this.getState();
  }

  private serialize(testOwner: TestOwner): SerializedTestOwner {
    return {
      username: testOwner.username,
      password: testOwner.password,
      owner: testOwner.owner,
    };
  }

  private deserialize(data: SerializedTestOwner): TestOwner {
    const testOwner = new TestOwner(this.dataProviderUrl, data.username, data.password);
    testOwner.owner = data.owner;
    return testOwner;
  }

  private save(): void {
    localStorage.setItem('testOwner', JSON.stringify(this.clusters.map(this.serialize)));
    localStorage.setItem('invitations', JSON.stringify(this.allInvitations));
  }

  private async load(): Promise<void> {
    const data = localStorage.getItem('testOwner');
    if (!data) return;
    this.clusters = JSON.parse(data).map((obj: SerializedTestOwner) => this.deserialize(obj));
    if (this.clusters.length > 0) {
      await this.selectCluster(this.clusters[0]);
    }
  }

  private loadInvitations(): Invitation[] {
    const data = localStorage.getItem('invitations');
    if (!data) {
      this.allInvitations = [];
      return [];
    }
    this.allInvitations = JSON.parse(data) as Invitation[];
    // Return only invitations for the current namespace
    return this.allInvitations.filter((inv: Invitation) =>
      inv.namespaceId === this.selectedNamespace?.id,
    );
  }

  private async loginIfNeccessary(testOwner: TestOwner): Promise<void> {
    if (testOwner.token) return;
    await testOwner.login();
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) return error;
    if (typeof error === 'object' && error && 'message' in error) {
      return new Error(String(error.message));
    }
    return new Error('Unknown error occurred');
  }
}

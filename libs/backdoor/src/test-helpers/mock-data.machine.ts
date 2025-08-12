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
  private currentNamespaceInvitations: Invitation[] = [];
  private selectedTestOwner?: TestOwner;
  private selectedNamespace?: NamespaceView;
  private dataProviderUrl: string;
  private currentProfile = 'default';
  private readonly STORAGE_PREFIX = 'mock-data-';
  private readonly LAST_PROFILE_KEY = 'mock-data-last-profile';

  constructor(dataProviderUrl: string) {
    this.dataProviderUrl = dataProviderUrl;
  }

  async initialize(): Promise<MockDataState> {
    const lastProfile = localStorage.getItem(this.LAST_PROFILE_KEY) || 'default';
    this.currentProfile = lastProfile;
    await this.load(undefined);
    if (this.selectedNamespace) {
      this.currentNamespaceInvitations = this.loadNamespaceInvitations(this.selectedNamespace.id);
    }
    return this.getState();
  }

  private getState(): MockDataState {
    return {
      clusters: this.clusters,
      namespaces: this.namespaces,
      allInvitations: this.allInvitations,
      selectedTestOwner: this.selectedTestOwner,
      selectedNamespace: this.selectedNamespace,
      currentNamespaceInvitations: this.currentNamespaceInvitations,
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
      this.currentNamespaceInvitations.push(invitation);
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
      // Update both allInvitations and currentNamespaceInvitations
      const invIndex = this.allInvitations.findIndex(inv => inv.invitationKey === invitation.invitationKey);
      if (invIndex !== -1) {
        this.allInvitations[invIndex] = invitation;
      }
      const currentInvIndex = this.currentNamespaceInvitations.findIndex(inv => inv.invitationKey === invitation.invitationKey);
      if (currentInvIndex !== -1) {
        this.currentNamespaceInvitations[currentInvIndex] = invitation;
      }
      this.save();
      // Load while preserving current cluster selection
      await this.load(this.selectedTestOwner);
      // Refresh namespace data to get updated users list
      if (this.selectedNamespace && this.selectedTestOwner) {
        await this.selectNamespace(this.selectedNamespace);
      }
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
    } else {
      // Clear state when there are no namespaces
      this.selectedNamespace = undefined;
      this.currentNamespaceInvitations = [];
      this.save();
    }
    return this.getState();
  }

  async selectNamespace(namespace: MNamespace): Promise<MockDataState> {
    if (!this.selectedTestOwner) throw new Error('No cluster selected');
    // Always fetch fresh namespace data to get updated users list
    this.selectedNamespace = await this.selectedTestOwner.getNamespace(namespace.id);
    this.currentNamespaceInvitations = this.loadNamespaceInvitations(namespace.id);
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

  public getAvailableProfiles(): string[] {
    const profiles: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX + 'testOwner-')) {
        profiles.push(key.replace(this.STORAGE_PREFIX + 'testOwner-', ''));
      }
    }
    return profiles;
  }

  public getCurrentProfile(): string {
    return this.currentProfile;
  }

  public async createProfile(profile: string): Promise<MockDataState> {
    this.currentProfile = profile;
    localStorage.setItem(this.LAST_PROFILE_KEY, profile);
    // Save empty state for new profile
    this.clusters = [];
    this.allInvitations = [];
    this.currentNamespaceInvitations = [];
    this.selectedTestOwner = undefined;
    this.selectedNamespace = undefined;
    this.save();
    return this.getState();
  }

  public async switchProfile(profile: string): Promise<MockDataState> {
    this.currentProfile = profile;
    localStorage.setItem(this.LAST_PROFILE_KEY, profile);
    await this.load(undefined);
    return this.getState();
  }

  private getStorageKey(key: string): string {
    return this.STORAGE_PREFIX + key + '-' + this.currentProfile;
  }

  private save(): void {
    localStorage.setItem(this.getStorageKey('testOwner'), JSON.stringify(this.clusters.map(this.serialize)));
    localStorage.setItem(this.getStorageKey('invitations'), JSON.stringify(this.allInvitations));
  }

  private async load(selectedTestOwner?: TestOwner): Promise<void> {
    const data = localStorage.getItem(this.getStorageKey('testOwner'));
    if (!data) return;
    this.clusters = JSON.parse(data).map((obj: SerializedTestOwner) => this.deserialize(obj));

    if (selectedTestOwner) {
      const clusterIndex = this.clusters.findIndex(c => c.owner === selectedTestOwner.owner);
      if (clusterIndex !== -1) {
        await this.selectCluster(this.clusters[clusterIndex]);
      }
    } else if (this.clusters.length > 0) {
      await this.selectCluster(this.clusters[0]);
    }
  }

  private loadNamespaceInvitations(namespaceId: number): Invitation[] {
    const data = localStorage.getItem(this.getStorageKey('invitations'));
    if (!data) {
      this.allInvitations = [];
      return [];
    }
    this.allInvitations = JSON.parse(data) as Invitation[];
    // Return only invitations for the specified namespace
    return this.allInvitations.filter((inv: Invitation) =>
      inv.namespaceId === namespaceId,
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

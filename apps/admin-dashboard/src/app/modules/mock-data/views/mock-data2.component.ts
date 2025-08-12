import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../services/config.service';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';
import { Invitation, MNamespace, User, CreatePaymentEventData } from '@angular-monorepo/entities';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
  ],
  selector: 'admin-dashboard-mock-data2',
  templateUrl: './mock-data2.component.html',
  styleUrls: ['./mock-data2.component.css'],
})
export class MockData2Component implements OnInit {
  private readonly config = inject(ConfigService);
  private mockData!: MockDataMachine;

  public state?: MockDataState;
  public password = '';
  public username = '';
  public namespaceName = '';
  public email = '';
  public error = '';
  public errorCode = '';
  public actionDetails = '';
  public newProfileName = '';
  public availableProfiles: string[] = [];
  public currentProfile = '';
  public profileExpanded = false;

  public dismissError(): void {
    this.error = '';
    this.errorCode = '';
    this.actionDetails = '';
  }

  public toggleProfileExpanded(): void {
    this.profileExpanded = !this.profileExpanded;
  }
  public loading = {
    cluster: false,
    namespace: false,
    invitation: false,
    acceptInvitation: false,
    profile: false,
    paymentEvent: false,
  };

  public paymentEvent = {
    paidBy: [] as { user: User; amount: number; currency: string }[],
    benefitors: [] as { user: User; amount: number; currency: string }[],
    description: '',
    notes: '',
    createdBy: null as User | null,
  };

  async ngOnInit(): Promise<void> {
    this.mockData = new MockDataMachine(this.config.getConfig().dataProviderUrl, localStorage);
    this.state = await this.mockData.initialize();
    this.availableProfiles = this.mockData.getAvailableProfiles();
    this.currentProfile = this.mockData.getCurrentProfile();
  }

  async createNewCluster(): Promise<void> {
    this.loading.cluster = true;
    try {
      this.state = await this.mockData.createNewCluster(this.username, this.password);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading.cluster = false;
    }
  }

  async createNewNamespace(): Promise<void> {
    this.loading.namespace = true;
    try {
      this.state = await this.mockData.createNewNamespace(this.namespaceName);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading.namespace = false;
    }
  }

  async createNewInvitation(): Promise<void> {
    this.loading.invitation = true;
    try {
      this.state = await this.mockData.createNewInvitation(this.email);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading.invitation = false;
    }
  }

  async acceptInvitation(invitation: Invitation): Promise<void> {
    this.loading.acceptInvitation = true;
    try {
      this.state = await this.mockData.acceptInvitation(invitation);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading.acceptInvitation = false;
    }
  }

  async selectCluster(testOwner: TestOwner): Promise<void> {
    try {
      this.username = testOwner.username;
      this.password = testOwner.password;
      this.state = await this.mockData.selectCluster(testOwner);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async disposeCluster(testOwner: TestOwner): Promise<void> {
    try {
      this.loading.cluster = true;
      this.state = await this.mockData.disposeCluster(testOwner);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading.cluster = false;
    }
  }

  async selectNamespace(namespace: MNamespace): Promise<void> {
    this.paymentEvent = {
      paidBy: [],
      benefitors: [],
      description: '',
      notes: '',
      createdBy: null,
    };
    try {
      this.state = await this.mockData.selectNamespace(namespace);
      if (this.state.selectedNamespace) {
        this.namespaceName = this.state.selectedNamespace.name;
      }
      // Reset payment event form when changing namespace
      this.paymentEvent.paidBy = [];
      this.paymentEvent.benefitors = [];
      this.paymentEvent.description = '';
      this.paymentEvent.notes = '';
    } catch (error) {
      this.handleError(error);
    }
  }

  addToPaidBy(user: User): void {
    this.paymentEvent.paidBy.push({ user, amount: 0, currency: 'EUR' });
  }

  removeFromPaidBy(user: User, index: number): void {
    this.paymentEvent.paidBy.splice(index, 1);
  }

  addToBenefitors(user: User): void {
    this.paymentEvent.benefitors.push({ user, amount: 0, currency: 'EUR' });
  }

  removeFromBenefitors(user: User, index: number): void {
    this.paymentEvent.benefitors.splice(index, 1);
  }

  isPaymentValid(): boolean {
    return !this.loading.paymentEvent &&
           this.paymentEvent.paidBy.length > 0 &&
           this.paymentEvent.benefitors.length > 0 &&
           !this.paymentEvent.paidBy.some(p => !p.amount) &&
           !this.paymentEvent.benefitors.some(b => !b.amount) &&
           this.paymentEvent.createdBy !== null;
  }

  async addPaymentEvent(): Promise<void> {
    if (!this.state?.selectedNamespace || !this.paymentEvent.paidBy.length || !this.paymentEvent.benefitors.length) return;

    this.loading.paymentEvent = true;
    try {
      const record: CreatePaymentEventData = {
        paidBy: this.paymentEvent.paidBy.map(p => ({
          userId: p.user.id,
          amount: p.amount,
          currency: p.currency,
        })),
        benefitors: this.paymentEvent.benefitors.map(b => ({
          userId: b.user.id,
          amount: b.amount,
          currency: b.currency,
        })),
        description: this.paymentEvent.description || null,
        notes: this.paymentEvent.notes || null,
        createdBy: this.paymentEvent.createdBy!.id,
      };

      this.state = await this.mockData.addPaymentEventToNamespace(
        this.state.selectedNamespace.id,
        record.createdBy,
        record,
      );

      // Reset form
      this.paymentEvent.paidBy = [];
      this.paymentEvent.benefitors = [];
      this.paymentEvent.description = '';
      this.paymentEvent.notes = '';
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading.paymentEvent = false;
    }
  }

  private handleError(error: unknown): void {
    // eslint-disable-next-line no-console
    console.error('Error:', error);
    if (error instanceof Error) {
      this.error = error.message;
      this.errorCode = (error as unknown as { code: string }).code ?? '';
      this.actionDetails = error.stack ?? '';
    } else {
      this.error = 'An unknown error occurred';
    }
  }

  public async createProfile(): Promise<void> {
    if (!this.newProfileName) return;
    try {
      this.loading.profile = true;
      // Create new profile with empty state
      this.state = await this.mockData.createProfile(this.newProfileName);
      // Update UI
      this.availableProfiles = this.mockData.getAvailableProfiles();
      this.currentProfile = this.mockData.getCurrentProfile();
      this.newProfileName = '';
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading.profile = false;
    }
  }

  public async selectProfile(profile: string): Promise<void> {
    try {
      this.state = await this.mockData.switchProfile(profile);
      this.currentProfile = this.mockData.getCurrentProfile();
    } catch (error) {
      this.handleError(error);
    }
  }
}

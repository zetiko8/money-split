import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../services/config.service';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';
import { Invitation, MNamespace } from '@angular-monorepo/entities';

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
  public actionDetails = '';
  public loading = {
    cluster: false,
    namespace: false,
    invitation: false,
    acceptInvitation: false,
  };

  async ngOnInit(): Promise<void> {
    this.mockData = new MockDataMachine(this.config.getConfig().dataProviderUrl);
    this.state = await this.mockData.initialize();
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

  async selectNamespace(namespace: MNamespace): Promise<void> {
    try {
      this.state = await this.mockData.selectNamespace(namespace);
      if (this.state.selectedNamespace) {
        this.namespaceName = this.state.selectedNamespace.name;
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): void {
    // eslint-disable-next-line no-console
    console.log(error);
    if (error instanceof Error) {
      this.error = error.message;
      this.actionDetails = '';
    } else if (typeof error === 'object' && error && 'message' in error) {
      this.error = String(error.message);
      if ('code' in error) {
        this.actionDetails = String(error.code);
      }
    } else {
      this.error = 'ERROR';
    }
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../services/config.service';
import { TestOwner } from '@angular-monorepo/backdoor';
import { MNamespace, Invitation, NamespaceView } from '@angular-monorepo/entities';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
  ],
  selector: 'admin-dashboard-mock-data',
  templateUrl: './mock-data.component.html',
})
export class MockDataComponent implements OnInit {
  ngOnInit(): void {
    this.load();
  }
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  public password = '';
  public username = '';
  public namespaceName = '';
  public email = '';

  public selectedTestOwner?: TestOwner;
  public clusters: TestOwner[] = [];
  public namespaces: MNamespace[] = [];
  public selectedNamespace?: NamespaceView;
  public allInvitations: Invitation[] = [];
  public invitations: Invitation[] = [];

  public error = '';
  public actionDetails = '';

  async createNewCluster () {
    try {
      const testOwner = new TestOwner(this.config.getConfig().dataProviderUrl, this.username, this.password);
      await testOwner.register();
      this.clusters.push(testOwner);
      this.save();
      await this.selectCluster(testOwner);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createNewNamespace () {
    try {
      const testOwner = this.selectedTestOwner!;
      await testOwner.createNamespace(this.namespaceName);
      this.namespaces = await testOwner.getNamespaces();
      this.save();
    } catch (error) {
      this.handleError(error);
    }
  }

  async createNewInvitation () {
    try {
      const testOwner = this.selectedTestOwner!;
      const invitation = await testOwner.inviteToNamespace(this.email, this.selectedNamespace!.id);
      this.allInvitations.push(invitation);
      this.save();
      this.loadInvitations();
    } catch (error) {
      this.handleError(error);
    }
  }

  async acceptInvitation (invitation: Invitation) {
    try {
      const testOwner = new TestOwner(this.config.getConfig().dataProviderUrl, invitation.email, 'testpassword');
      await testOwner.register();
      await this.loginIfNeccessary(testOwner);
      await testOwner.acceptInvitation(invitation.email, invitation.invitationKey);
      invitation.accepted = true;
      this.save();
      await this.load();
    } catch (error) {
      this.handleError(error);
    }
  }

  async selectCluster (testOwner: TestOwner) {
    this.selectedTestOwner = testOwner;
    this.username = testOwner.username;
    this.password = testOwner.password;
    await this.loginIfNeccessary(testOwner);
    this.namespaces = await testOwner.getNamespaces();
    if (this.namespaces.length === 0) return;
    await this.selectNamespace(this.namespaces[0]);
  }

  async selectNamespace (namespace: MNamespace) {
    this.selectedNamespace = await this.selectedTestOwner!.getNamespace(namespace.id);
    this.namespaceName = namespace.name;
    this.loadInvitations();
  }

  private serialize (testOwner: TestOwner) {
    return {
      username: testOwner.username,
      password: testOwner.password,
      owner: testOwner.owner,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private deserialize (data: any) {
    const testOwner = new TestOwner(this.config.getConfig().dataProviderUrl, data.username, data.password);
    testOwner.owner = data.owner;
    return testOwner;
  }

  private save () {
    localStorage.setItem('testOwner', JSON.stringify(this.clusters.map(this.serialize)));
    localStorage.setItem('invitations', JSON.stringify(this.allInvitations));
  }

  private async load () {
    const data = localStorage.getItem('testOwner');
    if (!data) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.clusters = JSON.parse(data).map((obj: any) => this.deserialize(obj));
    if (this.clusters.length === 0) return;
    await this.selectCluster(this.clusters[0]);
  }

  private async loadInvitations () {
    const data = localStorage.getItem('invitations');
    if (!data) return;
    this.allInvitations = (JSON.parse(data) as Invitation[]) || [];
    this.invitations = this.allInvitations.filter((inv: Invitation) => {
      return inv.namespaceId === this.selectedNamespace?.id;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError (error: any) {
    console.log(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).message) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.error = (error as any).message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.actionDetails = (error as any).code;
    } else {
      this.error = 'ERROR';
    }
  }

  private async loginIfNeccessary (testOwner: TestOwner) {
    if (testOwner.token) return;
    await testOwner.login();
  }
}


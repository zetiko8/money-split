import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfigService } from './services/config.service';
import { Owner } from '@angular-monorepo/entities';

interface MigrationResponse {
  id: string,
  up: boolean,
  error?: string,
  details?: string,
}

interface MigrationDefinition {
  id: string,
  isApplied: boolean,
}

@Component({
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
  ],
  selector: 'admin-dashboard-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  ngOnInit(): void {
    this.reload();
  }

  public password = '';
  public error = '';
  public actionDetails = '';

  public migrations: MigrationDefinition[] = [];

  public runMigrationUp (id: string) {
    this.error = '';
    this.actionDetails = '';
    this.http.get<MigrationResponse>(
      `${this.config.getConfig().middlewareUrl}/migration/up/${id}`,
      {
        headers: {
          'Authorization': 'Bearer ' + this.password,
        },
      },
    ).subscribe(this.subscriber);
  }

  public runMigrationDown (id: string) {
    this.error = '';
    this.actionDetails = '';
    this.http.get<MigrationResponse>(
      `${this.config.getConfig().middlewareUrl}/migration/down/${id}`,
      {
        headers: {
          'Authorization': 'Bearer ' + this.password,
        },
      },
    ).subscribe(this.subscriber);
  }

  public createTestAdmin () {
    this.error = '';
    this.actionDetails = '';
    this.http.get<Owner | { error: string }>(
      `${this.config.getConfig().middlewareUrl}/test-admin-create`,
      {
        headers: {
          'Authorization': 'Bearer ' + this.password,
        },
      },
    ).subscribe({
      next: (res: Owner | { error: string }) => {
        console.log(res);
        if ((res as { error: string }).error) {
          this.error = (res as { error: string }).error;
        } else {
          this.actionDetails = 'Create test admin';
        }
        this.reload();
      },
      error: (errorResponse: HttpErrorResponse) => {
        console.log(Object.entries(errorResponse));
        if (errorResponse.error) {
          this.error = errorResponse.error;
        } else {
          this.error = 'ERROR';
        }
        this.reload();
      },
    });
  }

  private subscriber = {
    next: (res: MigrationResponse) => {
      console.log(res);
      if (res.error) {
        this.error = res.error;
        if (res.details) {
          this.actionDetails = res.details;
        }
      } else {
        this.actionDetails = `${res.id} - ${res.up ? 'UP' : 'DOWN'}`;
      }
      this.reload();
    },
    error: (errorResponse: HttpErrorResponse) => {
      console.log(Object.entries(errorResponse));
      this.reload();
    },
  };

  private reload () {
    this.http.get<{ migrations: MigrationDefinition[]}>(
      `${this.config.getConfig().middlewareUrl}/migration`,
    ).subscribe({
      next: res => {
        this.migrations = res.migrations;
      },
    });
  }
}

import { Route } from '@angular/router';
import { DbManagementComponent } from './modules/db-management/views/db-management/db-management.component';
import { MockData2Component } from './modules/mock-data/views/mock-data2.component';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'db-management',
    pathMatch: 'full',
  },
  {
    path: 'db-management',
    component: DbManagementComponent,
  },
  {
    path: 'mock-data',
    component: MockData2Component,
  },
];

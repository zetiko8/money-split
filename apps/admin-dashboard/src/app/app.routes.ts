import { Route } from '@angular/router';
import { DbManagementComponent } from './modules/db-management/views/db-management/db-management.component';
import { MockDataComponent } from './modules/mock-data/views/mock-data.component';

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
    component: MockDataComponent,
  },
];

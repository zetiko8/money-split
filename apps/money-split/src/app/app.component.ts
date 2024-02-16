import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotificationUiComponent } from './components/notifications/notification-ui/notification-ui.component';
import { MoneySplitHeaderComponent } from './layout/header/header.component';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    NotificationUiComponent,
    MoneySplitHeaderComponent,
  ],
  selector: 'angular-monorepo-root',
  templateUrl: './app.component.html',
})
export class AppComponent {}

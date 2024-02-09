import { Component } from '@angular/core';
import { AppNotificationsService } from '../notifications.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'notification-ui',
  templateUrl: './notification-ui.component.html',
  imports: [
    CommonModule,
    TranslateModule,
  ],
})
export class NotificationUiComponent {
  constructor (
    public readonly notificationsService: AppNotificationsService,
  ) {}
}

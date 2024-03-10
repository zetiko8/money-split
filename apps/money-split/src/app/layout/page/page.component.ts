import { Component, Input } from '@angular/core';
import { FullScreenLoaderComponent } from '../../components/full-screen-loader/full-screen-loader.component';
import { Observable, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NotificationsControllerComponent } from '../../components/notifications/notifications-controller/notifications-controller.component';
import { Notification } from '../../components/notifications/notifications.types';

@Component({
  standalone: true,
  selector: 'page',
  templateUrl: './page.component.html',
  imports: [
    FullScreenLoaderComponent,
    CommonModule,
    NotificationsControllerComponent,
  ]
})
export class PageComponent {
  @Input() isLoading: Observable<boolean> = new Subject<boolean>();
  @Input() notifications$: Observable<Notification> = new Subject<Notification>();
}

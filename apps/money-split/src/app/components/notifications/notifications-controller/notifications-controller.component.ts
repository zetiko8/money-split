import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AppNotificationsService } from '../notifications.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Notification } from '../notifications.types';

@Component({
  standalone: true,
  selector: 'notifications-controller',
  templateUrl: './notifications-controller.component.html',
})
export class NotificationsControllerComponent implements OnDestroy, OnInit {

  @Input() notification$!: Observable<Notification>;
  private readonly destroy$ = new Subject<void>();

  constructor (
    private readonly notificationsService: AppNotificationsService,
  ) {}

  ngOnInit(): void {
    this.notification$
      .pipe(
        takeUntil(this.destroy$),
      ).subscribe(
        notification => this.notificationsService
          .displayNotification(notification),
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

}

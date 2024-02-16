import { Injectable } from '@angular/core';
import { Notification } from './notifications.types';
import { BehaviorSubject, Observable } from 'rxjs';
import { DisplayErrorService } from '../../services/global-error-handler.service';

@Injectable()
export abstract class AppNotificationsService
  extends DisplayErrorService
{
    abstract displayNotification (notification: Notification): void;
    abstract clearNotifications (): void;
    abstract notification$: Observable<Notification | null>;
}

@Injectable()
export class NotificationsService 
  extends AppNotificationsService {

  constructor () {
    super();
  }

  private readonly _notification$ = new BehaviorSubject<Notification | null>(null);
  public readonly notification$ = this._notification$.asObservable();

  displayNotification(notification: Notification): void {
    this._notification$.next(notification);
  }
    
  clearNotifications(): void {
    this._notification$.next(null);
  }

  display (error: Error) {
    this.displayNotification(
      {
        type: 'error',
        message: error.message,
        details: (error as any).appMessage,
      },
    );
  }
}

let notificationServiceInstance
    : NotificationsService | null = null;
export function notificationServiceFactory () {
  if (notificationServiceInstance === null) {
    notificationServiceInstance = new NotificationsService();
  }
  return notificationServiceInstance;
}
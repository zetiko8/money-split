import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface Notification {
    message: string,
    type: 'error'|'info'|'success',
    details?: string | undefined,
}

export function createNotificationObservable (errorSource$: Observable<Error | null>): Observable<Notification> {
  return errorSource$.pipe(
    filter(err => err !== null),
    map(event => {
      return { type: 'error', message: event?.message || 'Error' };
    }),
  );
}

export function createSuccessNotificationObservable (
  source$: Observable<unknown>,
  message: string,
): Observable<Notification> {
  return source$.pipe(
    map(() => {
      return { type: 'success', message };
    }),
  );
}

export function createSuccessNotificationObservableFromSource<T>(
  source$: Observable<T>,
  messageBuilder: (data: T) => string,
): Observable<Notification> {
  return source$.pipe(
    map(data => {
      return { type: 'success', message: messageBuilder(data) };
    }),
  );
}

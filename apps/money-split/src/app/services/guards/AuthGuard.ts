import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(public auth: AuthService, public router: Router) {}
  canActivate(): Observable<boolean> {
    return this.auth
      .isLoggedIn()
      .pipe(
        mergeMap(isLoggedIn => {
          if (!isLoggedIn)
            return from(this.auth.login())
              .pipe(map(() => true));

          return of(true);
        }),
      );
  }

  canActivateChild(): Observable<boolean> {
    return this.auth
      .isLoggedIn()
      .pipe(
        mergeMap(isLoggedIn => {
          if (!isLoggedIn)
            return from(this.auth.login())
              .pipe(map(() => true));

          return of(true);
        }),
      );
  }
}
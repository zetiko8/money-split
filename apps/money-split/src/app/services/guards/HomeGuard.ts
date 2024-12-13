import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild } from '@angular/router';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuthService } from '../auth/token/auth.token.service';
import { RoutingService } from '../routing/routing.service';

@Injectable()
export class HomeGuard implements CanActivate, CanActivateChild {
  constructor(
    public auth: AuthService,
    public router: Router,
    private routingService: RoutingService,
  ) {}

  canActivate(): Observable<boolean> {
    return this.guardImplementation();
  }

  canActivateChild(): Observable<boolean> {
    return this.guardImplementation();;
  }

  private guardImplementation () {
    return this.auth
      .isLoggedIn()
      .pipe(
        mergeMap(isLoggedIn => {
          if (!isLoggedIn) {
            this.routingService.goToLoginView();
            return of(false);
          }
          this.routingService.goToOwnerRealmView();
          return of(true);
        }),
      );
  }
}
import { Injectable, Inject, InjectionToken, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { APP_BASE_HREF } from '@angular/common';
import { AppError, AppErrorCode } from '../../../types';
import { jwtDecode } from 'jwt-decode';
import { ConfigService } from '../../config.service';
import { HttpClient } from '@angular/common/http';

export const KEYCLOAK_CONFIG = new InjectionToken<{ realm: string, clientId: string }>('KEYCLOAK_CONFIG');
@Injectable()
export class AuthService {

  private readonly http = inject(HttpClient);

  constructor(
    @Inject(APP_BASE_HREF) private baseHref: string,
    private readonly configService: ConfigService,
  ) {}

  silentAuth (): Observable<void> {
    return this.getToken()
      .pipe(
        map(() => undefined),
        catchError(err => {
          return throwError(() => new AppError(
            AppErrorCode.AuthenticationProviderFail, 
            'Auth cofing fail' + err.message));
        }),
      );
  }

  public login (data: {
    username: string,
    password: string
  }) {
    return this.http.post<{ token: string }>(
      this.configService.getConfig().middlewareUrl + '/login',
      data,
    )
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
        }),
      );
  }

  public logout (): void {
  }

  public getToken (): Observable<string | null> {
    const token = localStorage.getItem('token');
    if (token) return of(token);
    else return of(null);
  }

  public isLoggedIn (): Observable<boolean> {
    return this.getToken()
      .pipe(map(t => t !== null));
  }

  private hasTokenExpired (token: string) {
    const decoded = jwtDecode<{ exp: number }>(token);
    const isExpired = Date.now() >= (decoded.exp * 1000);
    return isExpired;
  }
}

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from './auth.token.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../config.service';
import { ERROR_CODE, Owner } from '@angular-monorepo/entities';

export interface UserProfile {
  username: string,
  isGuest: boolean,
  key?: string,
  avatarLink: string,
}

@Injectable()
export class UserService {

  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  public user$ = new BehaviorSubject<UserProfile>({
    username: 'guest',
    isGuest: true,
    avatarLink: './assets/images/guest-avatar.svg'
  });

  public loadUserProfile(): Observable<UserProfile> {
    return this.authService
      .isLoggedIn()
      .pipe(
        mergeMap(isLoggedIn => {
          if (isLoggedIn)
            return this.authService.getToken()
              .pipe(
                map(token => {
                  const td = jwtDecode<{ username: string, key: string }>(
                    token as string);
                  const user: UserProfile = {
                    username: td.username,
                    isGuest: false,
                    key: td.key,
                    avatarLink: './assets/images/guest-avatar.svg',
                  };
                  this.user$.next(user);
                  return user;
                }),
              );
          else {
            const guest = {
              username: 'guest',
              isGuest: true,
              avatarLink: './assets/images/guest-avatar.svg',   
            };
            this.user$.next(guest);
            return of(guest);
          }
        }),
      );
  }

  public logout () {
    return of(this.authService.logout());
  }

  public register (
    username: string, password: string
  ) {
    return this.http.post<Owner>(
      this.config.getConfig().middlewareUrl + '/register',
      { username, password }
    ).pipe(
      catchError(
        err => {
          if (
            err.error 
            && 
            err.error.error 
            === 
            ERROR_CODE.RESOURCE_ALREADY_EXISTS
          ) {
            return throwError(() => Error(ERROR_CODE.RESOURCE_ALREADY_EXISTS));
          } else {
            return throwError(() => err);
          }
        }
      )
    );
  }
}

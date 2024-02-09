import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from './auth.token.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../config.service';
import { Owner } from '@angular-monorepo/entities';

export interface UserProfile {
  username: string,
  isGuest: boolean,
  key?: string,
}

@Injectable()
export class UserService {

  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

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
                  };
                  return user;
                }),
              );
          else {
            return of({
              username: 'guest',
              isGuest: true,        
            });
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
    );
  }
}

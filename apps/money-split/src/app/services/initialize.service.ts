import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { AppConfig } from '../types';
import { InternationalizationService } from './internationalization/internationalization.service';
import { APP_BASE_HREF } from '@angular/common';
import { AuthService } from './auth/token/auth.token.service';
import { UserService } from './auth/token/auth.token.user.service';

@Injectable()
export class InitializeService {

  constructor(
    private readonly http: HttpClient,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly internationalizationService: InternationalizationService,
    @Inject(APP_BASE_HREF) private baseHref: string,
  ) {}

  init (): Observable<true> {
    return this.http.get<AppConfig>(
      // this.baseHref + '/assets/config/config.json',
      './assets/config/config.json',
    ).pipe(
      tap(res => {
        this.configService.setConfig(res);
      }),
      mergeMap(() => this.internationalizationService
        .initialize(),
      ),
      mergeMap(() => this.authService
        .silentAuth(),
      ),
      mergeMap(() => this.userService
        .loadUserProfile(),
      ),
      map(() => true),
    );
  }

}

export function initializeAppFactory(initializeService: InitializeService) {
  return () => initializeService.init();
}

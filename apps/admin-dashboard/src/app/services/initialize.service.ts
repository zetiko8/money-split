import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { AppConfig } from '../types';

@Injectable()
export class InitializeService {

  constructor(
    private readonly http: HttpClient,
    private readonly configService: ConfigService,
  ) {}

  init (): Observable<true> {
    return this.http.get<AppConfig>(
      './assets/config/config.json',
    ).pipe(
      tap(res => {
        this.configService.setConfig(res);
      }),
      map(() => true),
    );
  }

}

export function initializeAppFactory(initializeService: InitializeService) {
  return () => initializeService.init();
}

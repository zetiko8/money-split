import { EnvironmentProviders, Provider } from '@angular/core';
import { TokenInterceptor } from './token.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './auth.token.service';
import { UserService } from './auth.token.user.service';

export function getAuthTokenProviders (
): Array<Provider | EnvironmentProviders> {
  return [
    AuthService,
    TokenInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    UserService,
  ];
}
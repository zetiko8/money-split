import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { InitializeService, initializeAppFactory } from './services/initialize.service';
import { ConfigService } from './services/config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { getAuthTokenProviders } from './services/auth/token/auth.token.module';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { InternationalizationService } from './services/internationalization/internationalization.service';
import { InternationalizationModule } from './services/internationalization/internationalization.module';
import { AppNotificationsService, NotificationsService } from './components/notifications/notifications.service';
import { DisplayErrorService, GlobalErrorHandlerService } from './services/global-error-handler.service';
import { RoutingService } from './services/routing/routing.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
    InitializeService,
    ConfigService,
    InternationalizationService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [ InitializeService ],
      multi: true,
    },
    ...getAuthTokenProviders(),
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [PlatformLocation],
    },
    importProvidersFrom(
      InternationalizationModule.forRoot(),      
    ),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    },
    {
      provide: AppNotificationsService,
      useClass: NotificationsService,
    },
    {
      provide: DisplayErrorService,
      useClass: NotificationsService,
    },
    RoutingService,
  ],
};

export function getBaseHref(platformLocation: PlatformLocation): string {
  return platformLocation.getBaseHrefFromDOM();
}

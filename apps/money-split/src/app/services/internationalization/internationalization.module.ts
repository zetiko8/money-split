import { HttpBackend, HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { InternationalizationService } from './internationalization.service';
import { MultiTranslateHttpLoader } from './multi-translate-http-loader';

@NgModule({
  imports: [
    TranslateModule.forRoot({
      useDefaultLang: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createMultiTranslateLoader,
        deps: [HttpBackend],
      },
    }),
  ],
})
export class InternationalizationModule {
  static forRoot(): ModuleWithProviders<InternationalizationModule> {
    return {
      ngModule: InternationalizationModule,
      providers: [
        TranslateService,
        InternationalizationService,
      ],
    };
  }
}


function createMultiTranslateLoader(httpBackend: HttpBackend) {
  return new MultiTranslateHttpLoader(
    new HttpClient(httpBackend),
    {
      resources: [
        { prefix: './assets/i18n/', suffix: '.json' },
        // { prefix: './assets/common/i18n/', suffix: '.json' },
      ],
    },
  );
}
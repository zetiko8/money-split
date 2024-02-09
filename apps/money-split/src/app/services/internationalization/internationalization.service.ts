import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Injectable()
export class InternationalizationService {
  constructor (
    private readonly translateService: TranslateService,
  ) {}

  initialize () {
    /**
     * setup translations
     */
    this.translateService.addLangs(['sl']);
  
    /**
     * setup initial page title and language change listener
     */
    this.translateService.use('sl');
    // this.translateService.get('HEADER.TITLE').subscribe(translation=>this.titleService.setTitle(translation));
    this.translateService.onLangChange.subscribe(() => {
      // this.translateService.get('HEADER.TITLE').subscribe(translation=>this.titleService.setTitle(translation));
    });

    return of(true);
  }
}
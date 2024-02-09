import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

// model for a resource to load
export type I18nResource = { prefix: string; suffix: string };

export const mergeObjectsRecursively = (objects: Record<string, unknown>[]): Record<string, unknown> => {
  const mergedObject: Record<string, unknown> = {};

  for (const obj of objects) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          mergedObject[key] = mergeObjectsRecursively([mergedObject[key] as Record<string, unknown>, obj[key] as Record<string, unknown>]);
        } else {
          mergedObject[key] = obj[key];
        }
      }
    }
  }

  return mergedObject;
};

export class MultiTranslateHttpLoader implements TranslateLoader {
  resources: I18nResource[];
  
  constructor(
      private readonly http: HttpClient,
      { resources }: { resources: I18nResource[] },
  ) {
    this.resources = resources;
  }
  
  getTranslation(lang: string): Observable<Record<string, unknown>> {
    const resources: I18nResource[] = [...this.resources];
    
    return forkJoin(resources.map((config: I18nResource) => {
      return this.http.get<Record<string, unknown>>(`${config.prefix}${lang}${config.suffix}`);
    })).pipe(
      map((response: Record<string, unknown>[]) => 
        mergeObjectsRecursively(response)),
    );
  }
}
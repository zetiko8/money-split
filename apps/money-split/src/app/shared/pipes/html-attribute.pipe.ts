import { Pipe, PipeTransform } from '@angular/core';
import { sanitizeForHtmlAttribute } from '@angular-monorepo/utils';

@Pipe({
  name: 'htmlAttribute',
  standalone: true,
})
export class HtmlAttributePipe implements PipeTransform {
  transform(value: string): string {
    return sanitizeForHtmlAttribute(value);
  }
}

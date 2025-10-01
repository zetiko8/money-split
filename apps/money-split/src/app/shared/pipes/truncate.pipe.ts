import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string,
    limit: number = 100,
    ellipsis: string = '...',
  ): string {
    if (value.length <= limit) {
      return value;
    }
    return value.substring(0, limit) + ellipsis;
  }
}

@Pipe({
  name: 'truncateInTheMiddle',
  standalone: true,
})
export class TruncateInTheMiddlePipe implements PipeTransform {
  transform(
    value: string,
    limit: number = 100,
    ellipsis: string = '...',
  ): string {
    if (value.length <= limit) {
      return value;
    }
    const middle = Math.floor(limit / 2);

    return value.substring(0, middle)
      + ellipsis
      + value.substring(value.length - middle, value.length);
  }
}
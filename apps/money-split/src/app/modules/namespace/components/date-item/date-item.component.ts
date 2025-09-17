import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import moment from 'moment';

interface DateItem<T> {
  date: Date;
  contents: T[];
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'date-item',
  templateUrl: './date-item.component.html',
})
export class DateItemComponent<T> {
  @Input() items: DateItem<T>[] = [];
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<{ $implicit: T }>;

  static groupByDate<T extends { created: Date }, R>(records: T[], mapFn: (record: T) => R): DateItem<R>[] {
    const items: DateItem<R>[] = [];

    records.forEach((record) => {
      const dateItem = this.getDateItem(record.created, items);
      dateItem.contents.push(mapFn(record));
    });

    return items.filter(item => item.contents.length > 0);
  }

  private static getDateItem<T>(date: Date, items: DateItem<T>[]): DateItem<T> {
    const item = this.dateAlreadyExists(date, items);
    if (!item) {
      const newItem = { date, contents: [] };
      items.push(newItem);
      return newItem;
    }
    return item;
  }

  private static dateAlreadyExists<T>(date: Date, items: DateItem<T>[]) {
    return items.find(item =>
      moment(date).isSame(item.date, 'date') &&
      moment(date).isSame(item.date, 'month') &&
      moment(date).isSame(item.date, 'year'),
    );
  }
}


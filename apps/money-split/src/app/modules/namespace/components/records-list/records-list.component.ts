import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RecordView, SettlementListView } from '@angular-monorepo/entities';
import moment from 'moment';
import { RecordItemComponent } from '../record-item/record-item.component';
import { SettlementItemComponent } from '../settlement-item/settlement-item.component';

interface DateItem {
  date: Date,
  contents: ({
    isRecord: true,
    data: RecordView,
  } | {
    isRecord: false,
    data: SettlementListView,
  })[],
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RecordItemComponent,
    SettlementItemComponent,
  ],
  selector: 'records-list',
  templateUrl: './records-list.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'app-section',
  },
})
export class RecordsListComponent {
  @Input()
  set records (data: {
    records: RecordView[],
    settlements: SettlementListView[],
  }) {
    const items: DateItem[] = [];
    data.records.forEach((record) => {
      if (record.settlementId === null) {
        getDateItem(record.created, items)
          .contents.push({
            data: record,
            isRecord: true,
          });
      }
    });

    data.settlements.forEach((settlementView) => {
      getDateItem(settlementView.settlement.created, items)
        .contents.push({
          data: settlementView,
          isRecord: false,
        });
    });

    this._items
      = items.filter(item => !!(item.contents.length));
  };

  @Output() selectRecord = new EventEmitter<RecordView>();
  @Output() selectSettlement = new EventEmitter<SettlementListView>();
  @Output() markAsSettled = new EventEmitter<number>();
  @Output() markAsUnSettled = new EventEmitter<number>();
  public _items: DateItem[] = [];
}

function dateAlreadyExist (
  date: Date,
  items: DateItem[],
) {
  return items.find(
    item => {
      return (
        moment(date).isSame(item.date, 'date')
        &&
        moment(date).isSame(item.date, 'month')
        &&
        moment(date).isSame(item.date, 'year')
      );
    },
  );
}

function getDateItem (
  date: Date,
  items: DateItem[],
): DateItem {
  const item = dateAlreadyExist(date, items);
  if (
    item === undefined
  ) {
    const newItem = {
      date,
      contents: [],
    };
    items.push(newItem);

    return newItem;
  } else {
    return item;
  }
}
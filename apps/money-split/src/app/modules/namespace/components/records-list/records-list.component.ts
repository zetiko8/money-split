import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RecordView } from '@angular-monorepo/entities';
import { AvatarComponent } from '../../../../components/avatar.component';
import moment from 'moment';

interface DateItem {
  date: Date,
  records: RecordView[],
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AvatarComponent,
  ],
  selector: 'records-list',
  templateUrl: './records-list.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'app-section'
  }
})
export class RecordsListComponent {
  @Input() 
  set records (value: RecordView[]) {
    const items: DateItem[] = [];
    value.forEach((v, i) => {
      if (value[i - 1]) {
        const prevDate = moment(value[i - 1].created);

        if (
          !(moment(prevDate)
            .isSame(v.created, 'day'))
        ) {
          items.push({ 
            date: v.created, 
            records: [],
          });
        }
      }
      else {
        items.push({ 
          date: v.created,
          records: [],
        });
      }

      items[items.length - 1].records.push(v);
    });

    this._items = items;
  };

  @Output() selectRecord = new EventEmitter<RecordView>();
  public _items: DateItem[] = [];
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RecordView } from '@angular-monorepo/entities';
import { AvatarComponent } from '../../../../components/avatar.component';

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
  @Input() records: RecordView[] = [];
  @Output() selectRecord = new EventEmitter<RecordView>();
}

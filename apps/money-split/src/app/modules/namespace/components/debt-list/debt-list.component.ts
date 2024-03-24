import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RecordDataView } from '@angular-monorepo/entities';
import { AvatarComponent } from '../../../../components/avatar.component';
import { DebtItemComponent } from '../debt-item/debt-ltem.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AvatarComponent,
    DebtItemComponent,
  ],
  selector: 'debt-list',
  templateUrl: './debt-list.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'app-section'
  }
})
export class DebtListComponent {
  @Input() debts: RecordDataView[] = [];

  @Output() selectDebt = new EventEmitter<RecordDataView>();
}

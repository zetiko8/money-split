import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../../../components/avatar.component';
import { DebtItemComponent } from '../debt-item/debt-ltem.component';
import { SettlementRecord } from '@angular-monorepo/entities';

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
  @Input() debts: SettlementRecord[] = [];

  @Output() selectDebt = new EventEmitter<SettlementRecord>();
}

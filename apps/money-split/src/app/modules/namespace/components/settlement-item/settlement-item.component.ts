import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { SettlementListView } from '@angular-monorepo/entities';
import { DebtListComponent } from '../debt-list/debt-list.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DebtListComponent,
  ],
  selector: 'settlement-item',
  templateUrl: './settlement-item.component.html',
})
export class SettlementItemComponent {
  @Input() settlement!: SettlementListView;
}


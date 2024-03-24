import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { SettlementListView } from '@angular-monorepo/entities';
import { DebtItemComponent } from '../debt-item/debt-ltem.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DebtItemComponent,
  ],
  selector: 'settlement-item',
  templateUrl: './settlement-item.component.html',
})
export class SettlementItemComponent {
  @Input() settlement!: SettlementListView;

  @Output() markAsSettled = new EventEmitter<number>();
  @Output() markAsUnSettled = new EventEmitter<number>();
}


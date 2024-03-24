import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../../../components/avatar.component';
import { SettlementRecord } from '@angular-monorepo/entities';
import { CheckboxButtonComponent } from '@angular-monorepo/components';
import { DebtSpecificationComponent } from '../debt-specification/debt-specification.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AvatarComponent,
    CheckboxButtonComponent,
    DebtSpecificationComponent,
  ],
  selector: 'debt-item',
  templateUrl: './debt-item.component.html',
})
export class DebtItemComponent {
  @Input() debt!: SettlementRecord;
  @Output() markAsSettled = new EventEmitter<void>();
  @Output() markAsUnSettled = new EventEmitter<void>();
}

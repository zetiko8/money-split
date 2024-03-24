import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../../../components/avatar.component';
import { SettlementRecord } from '@angular-monorepo/entities';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AvatarComponent,
  ],
  selector: 'debt-item',
  templateUrl: './debt-item.component.html',
})
export class DebtItemComponent {
  @Input() debt!: SettlementRecord;
}

import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../../../components/avatar.component';
import { SettlementRecord } from '@angular-monorepo/entities';
import { CheckboxInputComponent } from '@angular-monorepo/components';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AvatarComponent,
    CheckboxInputComponent,
    FormsModule,
  ],
  selector: 'debt-specification',
  templateUrl: './debt-specification.component.html',
})
export class DebtSpecificationComponent {
  @Input() debt!: SettlementRecord;
}

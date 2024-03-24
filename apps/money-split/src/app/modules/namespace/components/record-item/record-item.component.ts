import { Component, Input } from '@angular/core';
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
  selector: 'record-item',
  templateUrl: './record-item.component.html',
})
export class RecordItemComponent {
  @Input() record!: RecordView;
}


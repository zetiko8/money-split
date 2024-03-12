import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
  ],
  selector: 'tabs-header',
  template: `
    <div
        role="tablist"
    >
        <div
            *ngFor="let tab of tabs"
            role="tab"
            (click)="tabSelected.emit(tab.id)"
            [class.active]="selectedTab === tab.id"
        >
            <i [ngClass]="tab.icon"></i>
            <h5>
                {{ tab.label | translate }}
            </h5>    
        </div>
    </div>
  `,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
//   host: { class: 'avatar' },
//   styles: [ '.avatar-image { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; }' ]
})
export class TabsHeaderComponent {

    @Input() tabs: { 
        id: string, 
        label: string, 
        icon: string 
    }[] = [];
    @Input() selectedTab = '';
    @Output() tabSelected = new EventEmitter<string>();

    constructor () {
        console.log(this);
    }
}

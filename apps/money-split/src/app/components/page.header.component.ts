import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { AvatarComponent } from './avatar.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    AvatarComponent,
  ],
  selector: 'page-header',
  template: `
    <div
        style="display: flex; justify-content: space-between; width: 100%;"
    >
        <ng-content></ng-content>
    </div>
  `,
  styles: [ ':host { display: block; width: 100%; padding: var(--gap-normal); }' ]
})
export class PageHeaderComponent {}

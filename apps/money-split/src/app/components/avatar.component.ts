import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  imports: [
    CommonModule,
  ],
  selector: 'avatar',
  template: `
    <div 
        class="avatar-image"
        [style]="{
            backgroundColor: backgroundColor,
            color: color,
        }"
    >
        {{ name.substring(0, 1).toUpperCase() }}
    </div>
  `,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'avatar' },
  styles: [ '.avatar-image { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; }' ]
})
export class AvatarComponent {
    @Input() name = '';
    @Input() color = '';
    @Input() backgroundColor = '';
}

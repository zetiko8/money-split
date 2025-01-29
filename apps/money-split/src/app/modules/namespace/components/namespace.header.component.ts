import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AvatarComponent } from '../../../components/avatar.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    AvatarComponent,
  ],
  selector: 'namespace-header',
  template: `
    <div
        data-test="namespace-view-page-header"
        style="display: flex; justify-content: space-between; width: 100%;"
    >
        <h4>
            <button
                class="icon-btn"
                (click)="backNavigation.emit()"
            >
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            {{ name }}
        </h4>
        <avatar
            [avatarId]="avatarId"
            [name]="name"
        ></avatar>
    </div>
  `,
  styles: [ ':host { display: block; width: 100%; padding: var(--gap-normal); }' ],
})
export class NamespaceHeaderComponent {
    @Input() name = '';
    @Input() avatarId: number | null = null;
    @Output() backNavigation = new EventEmitter<void>();
}

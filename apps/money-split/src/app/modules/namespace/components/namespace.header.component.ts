import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AvatarComponent } from '../../../components/avatar.component';
import { inject } from '@angular/core';
import { RoutingService } from '../../../services/routing/routing.service';

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
                data-test="navigate-back-button"
            >
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            {{ name }}
        </h4>
        <avatar
            [avatarId]="avatarId"
            [name]="name"
            data-test="edit-namespace-button"
            (click)="routingService.goToEditNamespaceView()"
        ></avatar>
    </div>
  `,
  styles: [ ':host { display: block; width: 100%; padding: var(--gap-normal); }' ],
})
export class NamespaceHeaderComponent {
    @Input() name = '';
    @Input() avatarId: number | null = null;
    @Output() backNavigation = new EventEmitter<void>();

    public readonly routingService = inject(RoutingService);
}

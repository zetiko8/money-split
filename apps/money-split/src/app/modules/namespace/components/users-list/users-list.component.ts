import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Invitation, User } from '@angular-monorepo/entities';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
  ],
  selector: 'users-list',
  templateUrl: './users-list.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'app-section'
  }
})
export class UsersListComponent {
  @Input() isLoadingUsers: boolean = false;
  @Input() isLoadingInvitations: boolean = false;
  @Input() users: User[] = [];
  @Input() invitations: Invitation[] = [];
  @Output() selectUser = new EventEmitter<User>();
  @Output() selectInvitation = new EventEmitter<Invitation>();
  @Output() invite = new EventEmitter<void>();
}

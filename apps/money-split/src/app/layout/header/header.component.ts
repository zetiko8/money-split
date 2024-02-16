import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/auth/token/auth.token.user.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
  ],
  selector: 'money-split-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.scss' ]
})
export class MoneySplitHeaderComponent {
    public readonly userService = inject(UserService);
}

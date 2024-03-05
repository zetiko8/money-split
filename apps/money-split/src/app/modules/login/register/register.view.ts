import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from '../../../components/register/register.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RegisterComponent,
  ],
  selector: 'register-view',
  templateUrl: './register.view.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class RegisterView {
}

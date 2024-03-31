import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
  ],
  selector: 'home-view',
  templateUrl: './home.view.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class HomeView {}

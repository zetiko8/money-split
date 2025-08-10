import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../services/config.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
  ],
  selector: 'admin-dashboard-mock-data',
  templateUrl: './mock-data.component.html',
})
export class MockDataComponent implements OnInit {
  ngOnInit(): void {
    console.log(this.config.getConfig());
  }
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  public password = '';

  createNewCluster () {
    console.log(this.password);
  }
}

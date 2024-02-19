import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, inject } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { AvatarData } from '@angular-monorepo/entities';

@Component({
  standalone: true,
  imports: [
    CommonModule,
  ],
  selector: 'avatar',
  template: `
    <div
        *ngIf="dataUrl === null && avatarDataUrl === null"
        class="avatar-image"
        [style]="{
            backgroundColor: backgroundColor,
            color: color,
        }"
    >
        {{ name.substring(0, 1).toUpperCase() }}
    </div>
    <div 
        *ngIf="dataUrl !== null"
        class="avatar-image"
    >
        <img [src]="dataUrl" alt="">
    </div>
    <div 
        *ngIf="avatarDataUrl !== null"
        class="avatar-image"
    >
        <img [src]="avatarDataUrl" alt="">
    </div>
  `,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'avatar' },
  styles: [ '.avatar-image { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; }' ]
})
export class AvatarComponent {

  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

    @Input() name = '';
    @Input() color = '#271d3b';
    @Input() backgroundColor = '#2ebf91';
    @Input() avatarDataUrl: string | null = null;

    public dataUrl: string | null = null;
    @Input() 
    set avatarId (id: number | null) {
      this.http.get<AvatarData>(
        this.config.getConfig().middlewareUrl + '/avatar/' + id
      ).subscribe(
        avatar => {
          if (avatar.dataUrl) {
            this.dataUrl = avatar.dataUrl;
          } 
          else {
            this.backgroundColor = avatar.color;
          }
        }
      )
    };
}

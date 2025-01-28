import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, inject } from '@angular/core';
import { AvatarService } from '../services/avatar.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ConfigService } from '../services/config.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
  ],
  selector: 'avatar',
  template: `
    <div
        *ngIf="url === null && avatarUrl === null"
        class="avatar-image"
        [style]="{
            backgroundColor: backgroundColor,
            color: color,
        }"
    >
        {{ name.substring(0, 1).toUpperCase() }}
    </div>
    <img
        *ngIf="url !== null"
        [src]="staticUrl + '/' + url"
        alt=""
    >
    <img
        *ngIf="avatarUrl !== null"
        [src]="avatarUrl"
        alt=""
    >
  `,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'avatar' },
  styles: [ '.avatar-image { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; }' ],
})
export class AvatarComponent implements OnDestroy {

  private readonly config = inject(ConfigService);
  private readonly avatarService = inject(AvatarService);
  private readonly destroy$ = new Subject<void>();


  public staticUrl = this.config.getConfig().staticUrl;
    @Input() name = '';
    @Input() color = '#271d3b';
    @Input() backgroundColor = '#2ebf91';
    @Input() avatarUrl: string | null = null;

    public url: string | null = null;
    @Input()
    set avatarId (id: number | null) {
      if (id !== null) {
        this.avatarService.load(id)
          .pipe(
            takeUntil(this.destroy$),
            take(1),
          )
          .subscribe(
            avatar => {
              console.log(id);
              console.log(avatar);
              if (avatar.url) {
                this.url = avatar.url;
              }
              else {
                this.backgroundColor = avatar.color;
              }
            },
          );
      }
    };

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
}

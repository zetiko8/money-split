import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { Observable, filter, map, merge, shareReplay, take } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { EditProfileService } from '../../services/edit-profile.service';
import { RoutingService } from '../../../../services/routing/routing.service';
import { CustomizeAvatarComponent } from '../../../../components/customize-avatar/customize-avatar.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EditAvatarData, EditProfileData } from '@angular-monorepo/entities';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    PageComponent,
    ReactiveFormsModule,
    CustomizeAvatarComponent,
  ],
  selector: 'edit-profile',
  templateUrl: './edit-profile.view.html',
  providers: [
    EditProfileService,
  ]
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class EditProfileView {

  private readonly editProfile = inject(EditProfileService);
  private readonly routingService = inject(RoutingService);

  public readonly loadProcess = new BoundProcess(
    () => this.editProfile.getProfile() 
  )
  public readonly submitProcess = new BoundProcess(
    (data: EditProfileData) => this.editProfile.editProfile(data), 
  )

  public readonly profile$
    = merge(
      this.loadProcess.execute(''),
      this.submitProcess.success$,
    )
    .pipe(
      map(profile => {
        return Object.assign({}, profile, {
          form: new FormGroup({
            avatarColor: new FormControl<string>(
              profile.avatar.color),
            avatarImage: new FormControl<string | null>(
              null)
          })
        })
      }),
      shareReplay(1),
    );

  public readonly notification$: Observable<Notification> 
    = merge(this.loadProcess.error$) 
    .pipe(
      filter(err => err !== null),
      map(event => {
        return { type: 'error', message: event?.message || 'Error' };
      }),  
    );

  edit () {
    this.profile$.pipe(
      take(1),
      map(profile => {
        const ownerAvatar: EditAvatarData = {
          avatarColor: profile.form.controls.avatarColor.value,
          avatarImage: profile.form.controls.avatarImage.value,
        };
        const payload: EditProfileData = {
          ownerAvatar
        };

        return payload;
      }),
    ).subscribe(data => this.submitProcess.execute(data));
  }

}

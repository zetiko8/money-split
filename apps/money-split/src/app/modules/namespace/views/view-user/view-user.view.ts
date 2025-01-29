import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { Observable, filter, map, merge, shareReplay } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { RoutingService } from '../../../../services/routing/routing.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewUserService } from '../../services/view-user.service';
import { AvatarComponent } from '../../../../components/avatar.component';
import { NamespaceHeaderComponent } from '../../components/namespace.header.component';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    PageComponent,
    ReactiveFormsModule,
    AvatarComponent,
    NamespaceHeaderComponent,
  ],
  selector: 'view-user',
  templateUrl: './view-user.view.html',
  providers: [
    ViewUserService,
  ],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ViewUserView {

  private readonly viewUser = inject(ViewUserService);
  public readonly routingService = inject(RoutingService);

  public readonly loadProcess = new BoundProcess(
    () => this.viewUser.getViewUser(),
  );

  public readonly data$
    = merge(
      this.loadProcess.execute(),
    )
      .pipe(
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

}

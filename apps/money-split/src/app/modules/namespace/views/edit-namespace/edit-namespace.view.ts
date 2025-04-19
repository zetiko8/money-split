import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BoundProcess, BoundProcess2 } from 'rombok';
import { PageComponent } from '../../../../layout/page/page.component';
import { Observable, filter, map, merge } from 'rxjs';
import { Notification } from '../../../../components/notifications/notifications.types';
import { NamespaceService } from '../../services/namespace.service';
import { RoutingService } from '../../../../services/routing/routing.service';
import { CreateNamespacePayload, MNamespaceSettings } from '@angular-monorepo/entities';
import { createNamespaceSettingsForm, NamespaceSettingsFormComponent } from '../../../../components/namespace-settings/namespace-settings.form';
import { combineLoaders } from '@angular-monorepo/components';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    PageComponent,
    NamespaceSettingsFormComponent,
  ],
  selector: 'edit-namespace',
  templateUrl: './edit-namespace.view.html',
  providers: [
    NamespaceService,
  ],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class EditNamespaceView {

  private readonly namespaceService = inject(NamespaceService);
  public readonly routingService = inject(RoutingService);

  public readonly loadProcess = new BoundProcess2<void, MNamespaceSettings>(
    () => this.namespaceService.getNamespaceSetting(),
  );

  public readonly form$ = this.loadProcess.execute().pipe(
    map(namespaceSettings => createNamespaceSettingsForm(namespaceSettings)),
  );

  public readonly editProcess = new BoundProcess(
    (data: CreateNamespacePayload) => this
      .namespaceService.editNamespace(data),
  );

  public readonly isLoading$ = combineLoaders([
    this.loadProcess.inProgress$,
    this.editProcess.inProgress$,
  ]);

  public readonly notification$: Observable<Notification>
    = merge(this.editProcess.error$, this.loadProcess.error$)
      .pipe(
        filter(err => err !== null),
        map(event => {
          return { type: 'error', message: event?.message || 'Error' };
        }),
      );

  public edit (form: CreateNamespacePayload) {

    this.editProcess.execute(
      form,
    )
      .subscribe(() => {
        this.routingService.goToNamespaceView();
      });
  }
}

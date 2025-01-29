import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ConfigService } from '../../../services/config.service';
import { Observable, combineLatest, mergeMap } from 'rxjs';
import { ViewUserViewData } from '@angular-monorepo/entities';
import { RoutingService } from '../../../services/routing/routing.service';
import { DATA_PROVIDER_API } from '@angular-monorepo/api-interface';

@Injectable()
export class ViewUserService {

  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);
  private readonly routingService = inject(RoutingService);

  public getViewUser (
  ): Observable<ViewUserViewData> {
    return combineLatest(
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
      this.routingService.getViewUserId(),
    )
      .pipe(
        mergeMap(([ownerKey, namespaceId, userId]) => {
          return DATA_PROVIDER_API.getViewUserApi.callObservable(
            null,
            { ownerKey, namespaceId, userId },
            (url) => {
              return this.http.get<ViewUserViewData>(this.config.getConfig().middlewareUrl + url);
            },
          );
        },
        ),
      );
  }
}
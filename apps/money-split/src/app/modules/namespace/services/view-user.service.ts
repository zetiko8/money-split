import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, mergeMap } from 'rxjs';
import { ViewUserViewData } from '@angular-monorepo/entities';
import { RoutingService } from '../../../services/routing/routing.service';
import { DataService } from '../../data.service';

@Injectable()
export class ViewUserService {

  private readonly dataService = inject(DataService);
  private readonly routingService = inject(RoutingService);

  public getViewUser (
  ): Observable<ViewUserViewData> {
    return combineLatest(
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
      this.routingService.getViewUserId(),
    )
      .pipe(
        mergeMap(([ownerKey, namespaceId, userId]) => this.dataService.getViewUser(ownerKey, namespaceId, userId)),
      );
  }
}
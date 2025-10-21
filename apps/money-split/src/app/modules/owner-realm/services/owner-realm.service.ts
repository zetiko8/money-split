import { Injectable, inject } from '@angular/core';
import { Observable, mergeMap } from 'rxjs';
import { CreateNamespacePayload, MNamespace } from '@angular-monorepo/entities';
import { RoutingService } from '../../../services/routing/routing.service';
import { DataService } from '../../data.service';

@Injectable()
export class OwnerRealmService {

  private readonly dataService = inject(DataService);
  private readonly routingService = inject(RoutingService);

  public createNewNamespace (
    data: CreateNamespacePayload,
  ): Observable<MNamespace> {
    return this.routingService.getOwnerKey()
      .pipe(
        mergeMap(ownerKey => this.dataService.createNewNamespace(ownerKey, data)),
      );
  }

  public getNamespaces (
  ): Observable<MNamespace[]> {
    return this.routingService.getOwnerKey()
      .pipe(
        mergeMap(ownerKey => this.dataService.getNamespaces(ownerKey)),
      );
  }
}
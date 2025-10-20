import { Injectable, inject } from '@angular/core';
import { Observable, mergeMap } from 'rxjs';
import { EditProfileData, MNamespace, OwnerProfileView } from '@angular-monorepo/entities';
import { RoutingService } from '../../../services/routing/routing.service';
import { DataService } from '../../data.service';

@Injectable()
export class EditProfileService {

  private readonly dataService = inject(DataService);
  private readonly routingService = inject(RoutingService);

  public createNewNamespace (
    data: {
            namespaceName: string
        },
  ): Observable<MNamespace> {
    return this.routingService.getOwnerKey()
      .pipe(
        mergeMap(ownerKey => this.dataService.createNewNamespace(ownerKey, { namespaceName: data.namespaceName, avatarColor: null, avatarUrl: null })),
      );
  }

  public getProfile (
  ): Observable<OwnerProfileView> {
    return this.routingService.getOwnerKey()
      .pipe(
        mergeMap(ownerKey => this.dataService.getProfile(ownerKey)),
      );
  }

  public editProfile (
    profile: EditProfileData,
  ): Observable<OwnerProfileView> {
    return this.routingService.getOwnerKey()
      .pipe(
        mergeMap(ownerKey => this.dataService.editProfile(ownerKey, profile)),
      );
  }
}
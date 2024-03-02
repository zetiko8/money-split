import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ConfigService } from "../../../services/config.service";
import { Observable, mergeMap } from "rxjs";
import { EditProfileData, MNamespace, OwnerProfileView } from "@angular-monorepo/entities";
import { RoutingService } from "../../../services/routing/routing.service";

@Injectable()
export class EditProfileService {

    private readonly http = inject(HttpClient);
    private readonly config = inject(ConfigService);
    private readonly routingService = inject(RoutingService);

    public createNewNamespace (
        data: { 
            namespaceName: string
        }
    ): Observable<MNamespace> {
        return this.routingService.getOwnerKey()
            .pipe(
                mergeMap(ownerKey => this.http.post<MNamespace>(
                        this.config.getConfig().middlewareUrl 
                        + '/'
                        + ownerKey
                        + "/namespace",
                        { name: data.namespaceName }
                    )
                )
            )
    }

    public getProfile (
    ): Observable<OwnerProfileView> {
        return this.routingService.getOwnerKey()
        .pipe(
            mergeMap(ownerKey => this.http.get<OwnerProfileView>(
                    this.config.getConfig().middlewareUrl 
                    + '/'
                    + ownerKey
                    + "/profile"
                )
            )
        )
    }

    public editProfile (
        profile: EditProfileData,
    ): Observable<OwnerProfileView> {
        return this.routingService.getOwnerKey()
        .pipe(
            mergeMap(ownerKey => this.http.post<OwnerProfileView>(
                    this.config.getConfig().middlewareUrl 
                    + '/'
                    + ownerKey
                    + "/profile",
                    profile,
                ),
            )
        )
    }
}
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ConfigService } from "../../../services/config.service";
import { Observable, mergeMap } from "rxjs";
import { CreateNamespacePayload, MNamespace } from "@angular-monorepo/entities";
import { RoutingService } from "../../../services/routing/routing.service";

@Injectable()
export class OwnerRealmService {

    private readonly http = inject(HttpClient);
    private readonly config = inject(ConfigService);
    private readonly routingService = inject(RoutingService);

    public createNewNamespace (
        data: CreateNamespacePayload,
    ): Observable<MNamespace> {
        return this.routingService.getOwnerKey()
            .pipe(
                mergeMap(ownerKey => this.http.post<MNamespace>(
                        this.config.getConfig().middlewareUrl 
                        + '/'
                        + ownerKey
                        + "/namespace",
                        data,
                    )
                )
            )
    }

    public getNamespaces (
    ): Observable<MNamespace[]> {
        return this.routingService.getOwnerKey()
        .pipe(
            mergeMap(ownerKey => this.http.get<MNamespace[]>(
                    this.config.getConfig().middlewareUrl 
                    + '/'
                    + ownerKey
                    + "/namespace"
                )
            )
        )
    }
}
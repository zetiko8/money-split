import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ConfigService } from "../../../services/config.service";
import { Observable, combineLatest, mergeMap } from "rxjs";
import { MNamespace, NamespaceView } from "@angular-monorepo/entities";
import { RoutingService } from "../../../services/routing/routing.service";

@Injectable()
export class NamespaceService {

    private readonly http = inject(HttpClient);
    private readonly config = inject(ConfigService);
    private readonly routingService = inject(RoutingService);

    public getNamespace (): Observable<NamespaceView> {
        return combineLatest([
            this.routingService.getOwnerKey(),
            this.routingService.getNamespaceId()
        ])
        .pipe(
            mergeMap(([ownerKey, namespaceId]) => this.http.get<NamespaceView>(
                    this.config.getConfig().middlewareUrl 
                    + '/'
                    + ownerKey
                    + "/namespace/"
                    + namespaceId,
                )
            )
        )
    }

    public inviteOwner (
        email: string
    ): Observable<MNamespace> {
        return combineLatest([
            this.routingService.getOwnerKey(),
            this.routingService.getNamespaceId()
        ])
            .pipe(
                mergeMap(([ownerKey, namespaceId]) => this.http.post<MNamespace>(
                        this.config.getConfig().middlewareUrl 
                        + '/'
                        + ownerKey
                        + "/namespace/"
                        + namespaceId
                        + "/invite",
                        { email }
                    )
                )
            )
    }

    public addRecord () {

    }
}
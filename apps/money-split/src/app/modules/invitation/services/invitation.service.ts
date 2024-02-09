import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ConfigService } from "../../../services/config.service";
import { Observable, combineLatest, mergeMap } from "rxjs";
import { Invitation, InvitationViewData } from "@angular-monorepo/entities";
import { RoutingService } from "../../../services/routing/routing.service";

@Injectable()
export class InvitationService {

    private readonly http = inject(HttpClient);
    private readonly config = inject(ConfigService);
    private readonly routingService = inject(RoutingService);

    public getInvitationView (): Observable<InvitationViewData> {
        return combineLatest([
            this.routingService.getInvitationId(),
        ])
        .pipe(
            mergeMap(([invitationId]) => this.http.get<InvitationViewData>(
                    this.config.getConfig().middlewareUrl 
                    + '/'
                    + 'invitation/'
                    + invitationId,
                )
            )
        )
    }

    public acceptInvitation (name: string): Observable<Invitation> {
        return combineLatest([
            this.routingService.getInvitationId(),
        ])
            .pipe(
                mergeMap(([invitationId]) => this.http.post<Invitation>(
                        this.config.getConfig().middlewareUrl 
                        + '/invitation/'
                        + invitationId
                        + '/accept',
                    	{ name }
                    )
                )
            )
    }

    public rejectInvitation (): Observable<Invitation> {
        return combineLatest([
            this.routingService.getInvitationId(),
        ])
            .pipe(
                mergeMap(([invitationId]) => this.http.get<Invitation>(
                        this.config.getConfig().middlewareUrl 
                        + '/invitation/'
                        + invitationId
                        + '/reject'

                    )
                )
            )
    }
}
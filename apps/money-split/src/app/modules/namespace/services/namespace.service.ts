import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ConfigService } from "../../../services/config.service";
import { Observable, catchError, combineLatest, mergeMap, throwError } from "rxjs";
import { CreateRecordData, ERROR_CODE, EditRecordData, MNamespace, NamespaceView, Record, RecordView } from "@angular-monorepo/entities";
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

    public getEditRecordView (
        recordId: number,
    ): Observable<{
        namespace: NamespaceView,
        record: RecordView,
    }> {
        return combineLatest([
            this.routingService.getOwnerKey(),
            this.routingService.getNamespaceId()
        ])
        .pipe(
            mergeMap(([ownerKey, namespaceId]) => this.http.get<{
                namespace: NamespaceView,
                record: RecordView,
            }>(
                    this.config.getConfig().middlewareUrl 
                    + '/'
                    + ownerKey
                    + "/namespace/"
                    + namespaceId
                    + '/edit/record/'
                    + recordId
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
                ),
                catchError(
                    err => {
                      if (
                        err.error 
                        && 
                        err.error.error 
                        === 
                        ERROR_CODE.RESOURCE_ALREADY_EXISTS
                      ) {
                        return throwError(() => Error(ERROR_CODE.RESOURCE_ALREADY_EXISTS));
                      } else {
                        return throwError(() => err);
                      }
                    }
                  )
            )
    }

    public addRecord (recordData: CreateRecordData) {
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
                        + '/'
                        + recordData.createdBy
                        + "/add",
                        recordData
                    )
                )
            )
    }

    public editRecord (recordData: EditRecordData) {
        return combineLatest([
            this.routingService.getOwnerKey(),
            this.routingService.getNamespaceId()
        ])
            .pipe(
                mergeMap(([ownerKey, namespaceId]) => this.http.post<Record>(
                        this.config.getConfig().middlewareUrl 
                        + '/'
                        + ownerKey
                        + "/namespace/"
                        + namespaceId
                        + '/'
                        + recordData.createdBy
                        + '/edit/record/'
                        + recordData.recordId,
                        recordData,
                    ),
                )
            );
    }
}
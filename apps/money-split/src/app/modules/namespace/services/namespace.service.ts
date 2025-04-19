import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ConfigService } from '../../../services/config.service';
import { Observable, catchError, combineLatest, mergeMap, throwError } from 'rxjs';
import { CreateNamespacePayload, CreateRecordData, ERROR_CODE, EditRecordData, MNamespace, MNamespaceSettings, NamespaceView, Record, RecordView, SettlePayload, SettlementPreview } from '@angular-monorepo/entities';
import { RoutingService } from '../../../services/routing/routing.service';
import { DATA_PROVIDER_API } from '@angular-monorepo/api-interface';

@Injectable()
export class NamespaceService {

  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);
  private readonly routingService = inject(RoutingService);

  public getNamespace (): Observable<NamespaceView> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this.http.get<NamespaceView>(
          this.config.getConfig().middlewareUrl
                    + '/'
                    + ownerKey
                    + '/namespace/'
                    + namespaceId,
        ),
        ),
      );
  }

  public getEditRecordView (
    recordId: number,
  ): Observable<{
        namespace: NamespaceView,
        record: RecordView,
    }> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this.http.get<{
                namespace: NamespaceView,
                record: RecordView,
            }>(
              this.config.getConfig().middlewareUrl
                    + '/'
                    + ownerKey
                    + '/namespace/'
                    + namespaceId
                    + '/edit/record/'
                    + recordId,
            ),
        ),
      );
  }

  public inviteOwner (
    email: string,
  ): Observable<MNamespace> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this.http.post<MNamespace>(
          this.config.getConfig().middlewareUrl
                        + '/'
                        + ownerKey
                        + '/namespace/'
                        + namespaceId
                        + '/invite',
          { email },
        ),
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
          },
        ),
      );
  }

  public addRecord (recordData: CreateRecordData) {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this.http.post<MNamespace>(
          this.config.getConfig().middlewareUrl
                        + '/'
                        + ownerKey
                        + '/namespace/'
                        + namespaceId
                        + '/'
                        + recordData.createdBy
                        + '/add',
          recordData,
        ),
        ),
      );
  }

  public editRecord (recordData: EditRecordData) {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this.http.post<Record>(
          this.config.getConfig().middlewareUrl
                        + '/'
                        + ownerKey
                        + '/namespace/'
                        + namespaceId
                        + '/'
                        + recordData.createdBy
                        + '/edit/record/'
                        + recordData.recordId,
          recordData,
        ),
        ),
      );
  }

  public settlePreview () {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this
          .http.get<SettlementPreview>(
            this.config.getConfig().middlewareUrl
                        + '/'
                        + ownerKey
                        + '/namespace/'
                        + namespaceId
                        + '/settle/preview',
          ),
        ),
      );
  }

  public settle (
    byUser: number,
    payload: SettlePayload,
  ) {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this
          .http.post<SettlementPreview>(
            this.config.getConfig().middlewareUrl
                        + '/'
                        + ownerKey
                        + '/namespace/'
                        + namespaceId
                        + '/settle/confirm/'
                        + byUser,
            payload,
          ),
        ),
      );
  }

  public markAsSettled (
    settlementDebtId: number,
    byUser: number,
  ) {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this
          .http.get<void>(
            this.config.getConfig().middlewareUrl
                        + '/'
                        + ownerKey
                        + '/namespace/'
                        + namespaceId
                        + '/settle/mark-as-settled/'
                        + byUser
                        + '/'
                        + settlementDebtId,
          ),
        ),
      );
  }

  public markAsUnSettled (
    settlementDebtId: number,
    byUser: number,
  ) {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this
          .http.get<void>(
            this.config.getConfig().middlewareUrl
                        + '/'
                        + ownerKey
                        + '/namespace/'
                        + namespaceId
                        + '/settle/mark-as-unsettled/'
                        + byUser
                        + '/'
                        + settlementDebtId,
          ),
        ),
      );
  }

  public editNamespace (payload: CreateNamespacePayload): Observable<MNamespaceSettings> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => {
          return DATA_PROVIDER_API.editNamespaceSettingApi.callObservable(
            payload,
            { ownerKey, namespaceId },
            (url) => {
              return this.http.post<MNamespaceSettings>(
                this.config.getConfig().middlewareUrl + url,
                payload,
              );
            },
          )},
        ),
      );
  }

  public getNamespaceSetting (): Observable<MNamespaceSettings> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => {
          return DATA_PROVIDER_API.getNamespaceSettingsApi.callObservable(
            null,
            { ownerKey, namespaceId },
            (url) => {
              return this.http.get<MNamespaceSettings>(
                this.config.getConfig().middlewareUrl + url,
              );
            },
          );
        }),
      );
  }
}
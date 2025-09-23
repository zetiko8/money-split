import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ConfigService } from '../../../services/config.service';
import { Observable, catchError, combineLatest, mergeMap, throwError } from 'rxjs';
import {
  CreateNamespacePayload,
  CreatePaymentEventData,
  CreateRecordData,
  ERROR_CODE,
  EditPaymentEventViewData,
  EditRecordData,
  MNamespace,
  MNamespaceSettings,
  NamespaceView,
  PaymentEvent,
  Record,
  SettlementPayload,
  SettlementPreview,
  SettlementSettings,
} from '@angular-monorepo/entities';
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

  public getPaymentEventView (
    recordId: number,
  ): Observable<EditPaymentEventViewData> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => {
          return DATA_PROVIDER_API.getEditPaymentEventViewApi.callObservable(
            null,
            { ownerKey, namespaceId, paymentEventId: recordId },
            (url) => {
              return this.http.get<EditPaymentEventViewData>(this.config.getConfig().middlewareUrl + url);
            },
          );
        },
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

  public addPaymentEvent (paymentEventData: CreatePaymentEventData) {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => {
          return DATA_PROVIDER_API.addPaymentEventApi.callObservable(
            paymentEventData,
            { ownerKey, namespaceId, userId: paymentEventData.createdBy },
            (url, method, payload) => {
              return this.http.post<PaymentEvent>(this.config.getConfig().middlewareUrl + url, payload);
            },
          );
        },
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

  public editPaymentEvent (
    paymentEventId: number,
    paymentEventData: CreatePaymentEventData,
  ) {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => {
          return DATA_PROVIDER_API.editPaymentEventApi.callObservable(
            paymentEventData,
            { ownerKey, namespaceId, userId: paymentEventData.createdBy, paymentEventId },
            (url, method, payload) => {
              return this.http.post<PaymentEvent>(this.config.getConfig().middlewareUrl + url, payload);
            },
          );
        },
        ),
      );
  }

  public settlePreview (
    payload: SettlementPayload,
  ): Observable<SettlementPreview> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => {
          return DATA_PROVIDER_API.settlePreviewApi.callObservable(
            payload,
            { ownerKey, namespaceId },
            (url) => {
              return this.http.post<SettlementPreview>(
                this.config.getConfig().middlewareUrl + url,
                payload,
              );
            },
          );
        }),
      );
  }

  public settleSettings (): Observable<SettlementSettings> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => {
          return DATA_PROVIDER_API.settleSettingsApi.callObservable(
            null,
            { ownerKey, namespaceId },
            (url) => {
              return this.http.get<SettlementSettings>(
                this.config.getConfig().middlewareUrl + url,
              );
            },
          );
        }),
      );
  }

  public settle (
    byUser: number,
    payload: SettlementPayload,
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
          );
        }),
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
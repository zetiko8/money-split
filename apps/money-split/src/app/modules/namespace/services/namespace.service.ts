import { Injectable, inject } from '@angular/core';
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
  SettlementPayload,
  SettlementPreview,
  SettlementSettings,
} from '@angular-monorepo/entities';
import { RoutingService } from '../../../services/routing/routing.service';
import { DataService } from '../../data.service';

@Injectable()
export class NamespaceService {

  private readonly dataService = inject(DataService);
  private readonly routingService = inject(RoutingService);

  public getNamespace (): Observable<NamespaceView> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this.dataService.getNamespace(ownerKey, namespaceId)),
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
        mergeMap(([ownerKey, namespaceId]) => this.dataService.getPaymentEventView(ownerKey, namespaceId, recordId)),
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
        mergeMap(([ownerKey, namespaceId]) => this.dataService.inviteOwner(ownerKey, namespaceId, email)),
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
        mergeMap(([ownerKey, namespaceId]) => this.dataService.addRecord(ownerKey, namespaceId, recordData)),
      );
  }

  public addPaymentEvent (paymentEventData: CreatePaymentEventData) {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this.dataService.addPaymentEvent(ownerKey, namespaceId, paymentEventData)),
      );
  }

  public editRecord (recordData: EditRecordData) {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this.dataService.editRecord(ownerKey, namespaceId, recordData)),
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
        mergeMap(([ownerKey, namespaceId]) => this.dataService.editPaymentEvent(ownerKey, namespaceId, paymentEventId, paymentEventData)),
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
        mergeMap(([ownerKey, namespaceId]) => this.dataService.settlePreview(ownerKey, namespaceId, payload)),
      );
  }

  public settleSettings (): Observable<SettlementSettings> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this.dataService.settleSettings(ownerKey, namespaceId)),
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
        mergeMap(([ownerKey, namespaceId]) => this.dataService.settle(ownerKey, namespaceId, byUser, payload)),
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
        mergeMap(([ownerKey, namespaceId]) => this.dataService.markAsSettled(ownerKey, namespaceId, settlementDebtId, byUser)),
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
        mergeMap(([ownerKey, namespaceId]) => this.dataService.markAsUnSettled(ownerKey, namespaceId, settlementDebtId, byUser)),
      );
  }

  public editNamespace (payload: CreateNamespacePayload): Observable<MNamespaceSettings> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this.dataService.editNamespace(ownerKey, namespaceId, payload)),
      );
  }

  public getNamespaceSetting (): Observable<MNamespaceSettings> {
    return combineLatest([
      this.routingService.getOwnerKey(),
      this.routingService.getNamespaceId(),
    ])
      .pipe(
        mergeMap(([ownerKey, namespaceId]) => this.dataService.getNamespaceSetting(ownerKey, namespaceId)),
      );
  }
}
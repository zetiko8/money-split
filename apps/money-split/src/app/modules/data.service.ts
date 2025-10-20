import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { Observable } from 'rxjs';
import {
  AvatarData,
  CreateNamespacePayload,
  CreatePaymentEventData,
  CreateRecordData,
  EditPaymentEventViewData,
  EditProfileData,
  EditRecordData,
  Invitation,
  InvitationViewData,
  MNamespace,
  MNamespaceSettings,
  NamespaceView,
  OwnerProfileView,
  PaymentEvent,
  Record,
  SettlementPayload,
  SettlementPreview,
  SettlementSettings,
  ViewUserViewData,
} from '@angular-monorepo/entities';
import { DATA_PROVIDER_API } from '@angular-monorepo/api-interface';

@Injectable()
export class DataService {

  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  // Namespace API calls
  public getNamespace(ownerKey: string, namespaceId: number): Observable<NamespaceView> {
    return this.http.get<NamespaceView>(
      this.config.getConfig().middlewareUrl
      + '/'
      + ownerKey
      + '/namespace/'
      + namespaceId,
    );
  }

  public getPaymentEventView(
    ownerKey: string,
    namespaceId: number,
    paymentEventId: number,
  ): Observable<EditPaymentEventViewData> {
    return DATA_PROVIDER_API.getEditPaymentEventViewApi.callObservable(
      null,
      { ownerKey, namespaceId, paymentEventId },
      (url) => {
        return this.http.get<EditPaymentEventViewData>(this.config.getConfig().middlewareUrl + url);
      },
    );
  }

  public inviteOwner(
    ownerKey: string,
    namespaceId: number,
    email: string,
  ): Observable<MNamespace> {
    return this.http.post<MNamespace>(
      this.config.getConfig().middlewareUrl
      + '/'
      + ownerKey
      + '/namespace/'
      + namespaceId
      + '/invite',
      { email },
    );
  }

  public addRecord(
    ownerKey: string,
    namespaceId: number,
    recordData: CreateRecordData,
  ): Observable<MNamespace> {
    return this.http.post<MNamespace>(
      this.config.getConfig().middlewareUrl
      + '/'
      + ownerKey
      + '/namespace/'
      + namespaceId
      + '/'
      + recordData.createdBy
      + '/add',
      recordData,
    );
  }

  public addPaymentEvent(
    ownerKey: string,
    namespaceId: number,
    paymentEventData: CreatePaymentEventData,
  ): Observable<PaymentEvent> {
    return DATA_PROVIDER_API.addPaymentEventApi.callObservable(
      paymentEventData,
      { ownerKey, namespaceId, userId: paymentEventData.createdBy },
      (url, method, payload) => {
        return this.http.post<PaymentEvent>(this.config.getConfig().middlewareUrl + url, payload);
      },
    );
  }

  public editRecord(
    ownerKey: string,
    namespaceId: number,
    recordData: EditRecordData,
  ): Observable<Record> {
    return this.http.post<Record>(
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
    );
  }

  public editPaymentEvent(
    ownerKey: string,
    namespaceId: number,
    paymentEventId: number,
    paymentEventData: CreatePaymentEventData,
  ): Observable<PaymentEvent> {
    return DATA_PROVIDER_API.editPaymentEventApi.callObservable(
      paymentEventData,
      { ownerKey, namespaceId, userId: paymentEventData.createdBy, paymentEventId },
      (url, method, payload) => {
        return this.http.post<PaymentEvent>(this.config.getConfig().middlewareUrl + url, payload);
      },
    );
  }

  public settlePreview(
    ownerKey: string,
    namespaceId: number,
    payload: SettlementPayload,
  ): Observable<SettlementPreview> {
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
  }

  public settleSettings(
    ownerKey: string,
    namespaceId: number,
  ): Observable<SettlementSettings> {
    return DATA_PROVIDER_API.settleSettingsApi.callObservable(
      null,
      { ownerKey, namespaceId },
      (url) => {
        return this.http.get<SettlementSettings>(
          this.config.getConfig().middlewareUrl + url,
        );
      },
    );
  }

  public settle(
    ownerKey: string,
    namespaceId: number,
    byUser: number,
    payload: SettlementPayload,
  ): Observable<SettlementPreview> {
    return this.http.post<SettlementPreview>(
      this.config.getConfig().middlewareUrl
      + '/'
      + ownerKey
      + '/namespace/'
      + namespaceId
      + '/settle/confirm/'
      + byUser,
      payload,
    );
  }

  public markAsSettled(
    ownerKey: string,
    namespaceId: number,
    settlementDebtId: number,
    byUser: number,
  ): Observable<void> {
    return this.http.get<void>(
      this.config.getConfig().middlewareUrl
      + '/'
      + ownerKey
      + '/namespace/'
      + namespaceId
      + '/settle/mark-as-settled/'
      + byUser
      + '/'
      + settlementDebtId,
    );
  }

  public markAsUnSettled(
    ownerKey: string,
    namespaceId: number,
    settlementDebtId: number,
    byUser: number,
  ): Observable<void> {
    return this.http.get<void>(
      this.config.getConfig().middlewareUrl
      + '/'
      + ownerKey
      + '/namespace/'
      + namespaceId
      + '/settle/mark-as-unsettled/'
      + byUser
      + '/'
      + settlementDebtId,
    );
  }

  public editNamespace(
    ownerKey: string,
    namespaceId: number,
    payload: CreateNamespacePayload,
  ): Observable<MNamespaceSettings> {
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
  }

  public getNamespaceSetting(
    ownerKey: string,
    namespaceId: number,
  ): Observable<MNamespaceSettings> {
    return DATA_PROVIDER_API.getNamespaceSettingsApi.callObservable(
      null,
      { ownerKey, namespaceId },
      (url) => {
        return this.http.get<MNamespaceSettings>(
          this.config.getConfig().middlewareUrl + url,
        );
      },
    );
  }

  // Edit Profile API calls
  public createNewNamespace(
    ownerKey: string,
    data: CreateNamespacePayload,
  ): Observable<MNamespace> {
    return this.http.post<MNamespace>(
      this.config.getConfig().middlewareUrl
      + '/'
      + ownerKey
      + '/namespace',
      data,
    );
  }

  public getProfile(ownerKey: string): Observable<OwnerProfileView> {
    return this.http.get<OwnerProfileView>(
      this.config.getConfig().middlewareUrl
      + '/'
      + ownerKey
      + '/profile',
    );
  }

  public editProfile(
    ownerKey: string,
    profile: EditProfileData,
  ): Observable<OwnerProfileView> {
    return this.http.post<OwnerProfileView>(
      this.config.getConfig().middlewareUrl
      + '/'
      + ownerKey
      + '/profile',
      profile,
    );
  }

  // Invitation API calls
  public getInvitationView(invitationId: string): Observable<InvitationViewData> {
    return this.http.get<InvitationViewData>(
      this.config.getConfig().middlewareUrl
      + '/'
      + 'invitation/'
      + invitationId,
    );
  }

  public acceptInvitation(invitationId: string, name: string): Observable<Invitation> {
    return this.http.post<Invitation>(
      this.config.getConfig().middlewareUrl
      + '/invitation/'
      + invitationId
      + '/accept',
      { name },
    );
  }

  public rejectInvitation(invitationId: string): Observable<Invitation> {
    return this.http.get<Invitation>(
      this.config.getConfig().middlewareUrl
      + '/invitation/'
      + invitationId
      + '/reject',
    );
  }

  // Owner Realm API calls
  public getNamespaces(ownerKey: string): Observable<MNamespace[]> {
    return this.http.get<MNamespace[]>(
      this.config.getConfig().middlewareUrl
      + '/'
      + ownerKey
      + '/namespace',
    );
  }

  // View User API calls
  public getViewUser(
    ownerKey: string,
    namespaceId: number,
    userId: number,
  ): Observable<ViewUserViewData> {
    return DATA_PROVIDER_API.getViewUserApi.callObservable(
      null,
      { ownerKey, namespaceId, userId },
      (url) => {
        return this.http.get<ViewUserViewData>(this.config.getConfig().middlewareUrl + url);
      },
    );
  }

  // Avatar API calls
  public loadAvatars(ids: number[]): Observable<AvatarData[]> {
    return this.http.get<AvatarData[]>(
      this.config.getConfig().middlewareUrl + '/avatar',
      {
        params: new HttpParams({
          fromObject: { avatarIds: ids },
        }),
      },
    );
  }

  // File Upload API calls
  public uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ url: string }>(
      this.config.getConfig().middlewareUrl + '/upload',
      formData,
    );
  }
}

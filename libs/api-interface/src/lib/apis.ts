import {
  AvatarData,
  CreateNamespacePayload,
  CreatePaymentEventData,
  EditProfileData,
  Invitation,
  InvitationViewData,
  MNamespace,
  MNamespaceSettings,
  NamespaceView,
  Owner,
  OwnerProfileView,
  PaymentEvent,
  Record,
  RecordData,
  RecordDataBackdoor,
  RegisterOwnerPayload,
  Settlement,
  SettlePayload,
  ViewUserViewData,
} from '@angular-monorepo/entities';
import { ApiDefinition, apiDefinition } from './helpers';
import { Observable } from 'rxjs';

export class ApiDefinitionObj <Payload, Params, ReturnType> {

  constructor (
    public readonly apiDefinition
      : ApiDefinition<Payload, Params, ReturnType>,
  ) {}

  getEndpoint (params: Params) {
    let url = this.apiDefinition.ajax.endpoint;
    for (const key in params) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      url = url.replace(':' + key, (params as any)[key]);
    }
    return url;
  }

  getMethod () {
    return this.apiDefinition.ajax.method;
  }

  async callPromise (
    payload: Payload,
    params: Params,
    implementation: (
      url: string,
      method: 'GET'|'POST',
      payload: Payload,
    ) => Promise<ReturnType>,
  ): Promise<ReturnType> {
    return implementation(
      this.getEndpoint(params),
      this.getMethod(),
      payload,
    );
  }

  callObservable (
    payload: Payload,
    params: Params,
    implementation: (
      url: string,
      method: 'GET'|'POST',
      payload: Payload,
    ) => Observable<ReturnType>,
  ): Observable<ReturnType> {
    return implementation(
      this.getEndpoint(params),
      this.getMethod(),
      payload,
    );
  }

}

export function createNamespaceApi() {
  return apiDefinition<
  CreateNamespacePayload,
  {
    ownerKey: string,
  },
  MNamespace>({
    endpoint: '/:ownerKey/namespace',
    method: 'POST',
  });
}

export function getNamespaceViewApi() {
  return apiDefinition<
  null,
  {
    ownerKey: string,
    namespaceId: number,
  },
  NamespaceView>({
    endpoint: '/:ownerKey/namespace/:namespaceId',
    method: 'GET',
  });
}

export function getNamespaceSettingsApi() {
  return apiDefinition<
  null,
  {
    ownerKey: string,
    namespaceId: number,
  },
  MNamespaceSettings>({
    endpoint: '/:ownerKey/namespace/:namespaceId/settings',
    method: 'GET',
  });
}

export function editNamespaceSettingApi() {
  return apiDefinition<
  CreateNamespacePayload,
  {
    ownerKey: string,
    namespaceId: number,
  },
  MNamespaceSettings>({
    endpoint: '/:ownerKey/namespace/:namespaceId/settings',
    method: 'POST',
  });
}

export function getOwnerProfileApi() {
  return apiDefinition<
  null,
  {
    ownerKey: string,
  },
  OwnerProfileView
  >({
    endpoint: '/:ownerKey/profile',
    method: 'GET',
  });
}

export function getAvatarApi() {
  return apiDefinition<
  null,
  {
    avatarId: number,
  },
  AvatarData>({
    endpoint: '/avatar/:avatarId',
    method: 'GET',
  });
}

export function createInvitationApi() {
  return apiDefinition<
  { email: string },
  {
    ownerKey: string,
    namespaceId: number,
  },
  Invitation>({
    endpoint: '/:ownerKey/namespace/:namespaceId/invite',
    method: 'POST',
  });
}

export function registerApi() {
  return apiDefinition<
  RegisterOwnerPayload,
  null,
  Owner>({
    endpoint: '/register',
    method: 'POST',
  });
}

export function acceptInvitationApi() {
  return apiDefinition<
  { name: string },
  {
    invitationKey: string,
  },
  Invitation>({
    endpoint: '/invitation/:invitationKey/accept',
    method: 'POST',
  });
}

export function getInvitationViewApi() {
  return apiDefinition<
  null,
  {
    invitationKey: string,
  },
  InvitationViewData>({
    endpoint: '/invitation/:invitationKey',
    method: 'GET',
  });
}

export function getOwnerNamespacesApi() {
  return apiDefinition<
  null,
  {
    ownerKey: string,
  },
  MNamespace[]>({
    endpoint: '/:ownerKey/namespace',
    method: 'GET',
  });
}

export function addRecordApi() {
  return apiDefinition<
  RecordData,
  {
    ownerKey: string,
    namespaceId: number,
    userId: number,
  },
  Record>({
    endpoint: '/:ownerKey/namespace/:namespaceId/:userId/add',
    method: 'POST',
  });
}

export function addPaymentEventApi() {
  return apiDefinition<
  CreatePaymentEventData,
  {
    ownerKey: string,
    namespaceId: number,
    userId: number,
  },
  PaymentEvent>({
    endpoint: '/:ownerKey/namespace/:namespaceId/:userId/add-payment-event',
    method: 'POST',
  });
}

export function addRecordApiBackdoor() {
  return apiDefinition<
  RecordDataBackdoor,
  {
    namespaceId: number,
  },
  Record>({
    endpoint: '/backdoor/:ownerKey/namespace/:namespaceId/:userId/add',
    method: 'POST',
  });
}

export function addPaymentEventApiBackdoor() {
  return apiDefinition<
  CreatePaymentEventData,
  {
    namespaceId: number,
  },
  PaymentEvent>({
    endpoint: '/backdoor/:ownerKey/namespace/:namespaceId/:userId/add-payment-event',
    method: 'POST',
  });
}

export function editOwnerProfileApi() {
  return apiDefinition<
  EditProfileData,
  {
    ownerKey: string,
  },
  OwnerProfileView>({
    endpoint: '/:ownerKey/profile',
    method: 'POST',
  });
}

export function settleConfirmApi() {
  return apiDefinition<
    SettlePayload,
    {
      ownerKey: string,
      byUser: number,
      namespaceId: number,
    },
    Settlement>({
      endpoint: '/:ownerKey/namespace/:namespaceId/settle/confirm/:byUser',
      method: 'POST',
    });
}

export function settleConfirmApiBackdoor() {
  return apiDefinition<
    {
      records: number[],
      settledOn: Date,
    },
    {
      ownerKey: string,
      byUser: number,
      namespaceId: number,
    },
    Settlement>({
      endpoint: '/backdoor/:ownerKey/namespace/:namespaceId/settle/confirm/:byUser',
      method: 'POST',
    });
}

export function getViewUserApi() {
  return apiDefinition<
  null,
  {
    ownerKey: string,
    namespaceId: number,
    userId: number,
  },
  ViewUserViewData>({
    endpoint: '/:ownerKey/namespace/:namespaceId/user/:userId',
    method: 'GET',
  });
}

export function editPaymentEventApi() {
  return apiDefinition<
  CreatePaymentEventData,
  {
    ownerKey: string,
    namespaceId: number,
    userId: number,
    paymentEventId: number,
  },
  PaymentEvent>({
    endpoint: '/:ownerKey/namespace/:namespaceId/:userId/edit-payment-event/:paymentEventId',
    method: 'POST',
  });
}

export const DATA_PROVIDER_API = {
  getNamespaceApi: new ApiDefinitionObj(getOwnerNamespacesApi()),
  createInvitationApi: new ApiDefinitionObj(createInvitationApi()),
  acceptInvitationApi: new ApiDefinitionObj(acceptInvitationApi()),
  getNamespaceViewApi: new ApiDefinitionObj(getNamespaceViewApi()),
  editOwnerProfileApi: new ApiDefinitionObj(editOwnerProfileApi()),
  addRecordApiBackdoor: new ApiDefinitionObj(addRecordApiBackdoor()),
  settleConfirmApi: new ApiDefinitionObj(settleConfirmApi()),
  settleConfirmApiBackdoor: new ApiDefinitionObj(settleConfirmApiBackdoor()),
  getViewUserApi: new ApiDefinitionObj(getViewUserApi()),
  registerApi: new ApiDefinitionObj(registerApi()),
  getNamespaceSettingsApi: new ApiDefinitionObj(getNamespaceSettingsApi()),
  editNamespaceSettingApi: new ApiDefinitionObj(editNamespaceSettingApi()),
  getAvatarApi: new ApiDefinitionObj(getAvatarApi()),
  addPaymentEventApi: new ApiDefinitionObj(addPaymentEventApi()),
  addPaymentEventApiBackdoor: new ApiDefinitionObj(addPaymentEventApiBackdoor()),
  editPaymentEventApi: new ApiDefinitionObj(editPaymentEventApi()),
};
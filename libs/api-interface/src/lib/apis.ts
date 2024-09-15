import {
  CreateNamespacePayload,
  EditProfileData,
  Invitation,
  InvitationViewData,
  MNamespace,
  NamespaceView,
  Owner,
  OwnerProfileView,
  Record,
  RecordData,
  RegisterOwnerPayload,
} from '@angular-monorepo/entities';
import { ApiDefinition, apiDefinition } from './helpers';

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

export const DATA_PROVIDER_API = {
  getNamespaceApi: new ApiDefinitionObj(getOwnerNamespacesApi()),
  createInvitationApi: new ApiDefinitionObj(createInvitationApi()),
  acceptInvitationApi: new ApiDefinitionObj(acceptInvitationApi()),
  getNamespaceViewApi: new ApiDefinitionObj(getNamespaceViewApi()),
  editOwnerProfileApi: new ApiDefinitionObj(editOwnerProfileApi()),
};
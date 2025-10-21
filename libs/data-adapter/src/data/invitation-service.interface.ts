import { Invitation, InvitationViewData } from '@angular-monorepo/entities';
import { AcceptInvitationDataValidationFn } from '../validation/validation.service.interface';

export interface IInvitationService {
  acceptInvitationValidation: AcceptInvitationDataValidationFn;

  acceptInvitation(
    invitationKey: string,
    ownerId: number,
    name: string,
  ): Promise<Invitation>;

  getInvitationViewData(
    invitationKey: string,
  ): Promise<InvitationViewData>;

  inviteToNamespace(
    email: string,
    namespaceId: number,
    ownerId: number,
    sendMail: (invitationKey: string) => Promise<void>,
  ): Promise<Invitation>;
}

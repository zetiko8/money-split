import { Transaction } from '../mysql-adapter';
import { Invitation, InvitationViewData } from '@angular-monorepo/entities';
import { randomUUID } from 'crypto';

export class InvitationHelpersService {

  static async acceptInvitationValidation(
    transaction: Transaction,
    invitationKey: string,
    ownerId: number,
    name: string,
  ) {
    const result = await transaction.jsonValidationProcedure(
      'call acceptInvitationValidation(?, ?, ?);',
      [
        invitationKey,
        ownerId,
        name,
      ],
    );
    return result;
  }

  static async acceptInvitation(
    transaction: Transaction,
    invitationKey: string,
    ownerId: number,
    name: string,
  ) {
    const result = await transaction.jsonProcedure<Invitation>(
      'call acceptInvitation(?, ?, ?);',
      [
        invitationKey,
        ownerId,
        name,
      ],
    );
    return result;
  }

  static async getInvitationViewData(
    transaction: Transaction,
    invitationKey: string,
  ) {
    const result = await transaction.jsonProcedure<InvitationViewData>(
      'call getInvitationView(?);',
      [
        invitationKey,
      ],
    );
    return result;
  }

  static async inviteToNamespace(
    transaction: Transaction,
    email: string,
    namespaceId: number,
    ownerId: number,
  ) {
    const invitation = await transaction.jsonProcedure<Invitation>(
      'call createInvitation(?, ?, ?, ?);',
      [
        email,
        ownerId,
        randomUUID(),
        namespaceId,
      ],
    );

    invitation.accepted = !!(invitation.accepted);
    invitation.rejected = !!(invitation.rejected);

    return invitation;
  }
};

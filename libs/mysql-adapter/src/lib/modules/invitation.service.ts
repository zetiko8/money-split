import { IInvitationService } from '@angular-monorepo/data-adapter';
import { getTransaction } from '../mysql-adapter';
import { Invitation, InvitationViewData } from '@angular-monorepo/entities';
import { Logger } from '@angular-monorepo/utils';
import { randomUUID } from 'crypto';

export class InvitationService implements IInvitationService {

  constructor(
    private readonly logger: Logger,
  ) {}

  async acceptInvitation(
    invitationKey: string,
    ownerId: number,
    name: string,
  ) {
    const transaction = await getTransaction(this.logger);
    const result = await transaction.jsonProcedure<Invitation>(
      'call acceptInvitation(?, ?, ?);',
      [
        invitationKey,
        ownerId,
        name,
      ],
    );
    await transaction.commit();
    return result;
  }

  async getInvitationViewData(
    invitationKey: string,
  ) {
    const transaction = await getTransaction(this.logger);
    const result = await transaction.jsonProcedure<InvitationViewData>(
      'call getInvitationView(?);',
      [
        invitationKey,
      ],
    );
    await transaction.commit();
    return result;
  }

  async inviteToNamespace(
    email: string,
    namespaceId: number,
    ownerId: number,
    sendMail: (invitationKey: string) => Promise<void>,
  ) {
    const transaction = await getTransaction(this.logger, false);
    try {
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

      await sendMail(invitation.invitationKey);

      await transaction.commit();
      return invitation;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

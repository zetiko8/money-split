import { IInvitationService } from '@angular-monorepo/data-adapter';
import { getTransactionContext } from '../mysql-adapter';
import { InvitationViewData } from '@angular-monorepo/entities';
import { Logger } from '@angular-monorepo/utils';
import { InvitationHelpersService } from './invitation.helpers.service';

export class InvitationService implements IInvitationService {

  constructor(
    private readonly logger: Logger,
  ) {}

  async acceptInvitation(
    invitationKey: string,
    ownerId: number,
    name: string,
  ) {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        return await InvitationHelpersService
          .acceptInvitation(transaction, invitationKey, ownerId, name);
      });
  }

  async getInvitationViewData(
    invitationKey: string,
  ) {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const result = await transaction.jsonProcedure<InvitationViewData>(
          'call getInvitationView(?);',
          [
            invitationKey,
          ],
        );
        return result;
      });
  }

  async inviteToNamespace(
    email: string,
    namespaceId: number,
    ownerId: number,
    sendMail: (invitationKey: string) => Promise<void>,
  ) {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const invitation = await InvitationHelpersService
          .inviteToNamespace(transaction, email, namespaceId, ownerId);

        await sendMail(invitation.invitationKey);

        return invitation;
      });
  }
};

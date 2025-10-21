import { BackdoorLoadData, BackdoorScenarioDataFixed, Owner, PaymentEvent } from '@angular-monorepo/entities';
import { query } from '../../connection/connection';
import { asyncMap, getRandomColor } from '@angular-monorepo/utils';
import { InvitationHelpersService, NamespaceService, OwnerService, PaymentEventService } from '@angular-monorepo/mysql-adapter';
import { getTransactionContext } from '@angular-monorepo/mysql-adapter';
import { LOGGER } from '../../helpers';
import { AUTHENTICATION } from '../authentication/authentication';

export const CYBACKDOOR_SERVICE = {
  load: async (ownerIds: number[]): Promise<BackdoorLoadData[]> => {

    const result = await asyncMap(ownerIds, async (ownerId) => {
      const namespaces = await new NamespaceService(LOGGER).getNamespacesForOwner(ownerId);

      const namespaceViews = await asyncMap(namespaces, async (namespace) => {
        return new NamespaceService(LOGGER).getNamespaceViewForOwner(namespace.id, ownerId);
      });

      const owner = (await query<Owner[]>(`
        SELECT * FROM \`Owner\`
        WHERE \`id\` = ${ownerId}
        `))[0];

      const data: BackdoorLoadData = {
        owner,
        namespaces: namespaceViews,
      };

      return data;
    });

    return result;
  },
  createScenario: async (scenarioData: BackdoorScenarioDataFixed) => {
    return await getTransactionContext({ logger: LOGGER}, async (transaction) => {
      await query(
        `call testDisposeMultiple('[${scenarioData.owners.map(o => ('"' + o.name + '"')).join(', ')}]')`,
      );

      const owners = await asyncMap(scenarioData.owners, async (owner) => {
        return await new OwnerService(LOGGER).createOwner({
          username: owner.name,
          password: owner.password,
          avatarColor: getRandomColor(),
          avatarUrl: null,
        }, AUTHENTICATION.getPasswordHash(owner.password));
      });

      await asyncMap(scenarioData.namespaces, async (namespace) => {
        const creator = owners.find(o => o.username === namespace.creator);
        const createdNamespace = await new NamespaceService(LOGGER).createNamespace({
          namespaceName: namespace.name,
          avatarColor: getRandomColor(),
          avatarUrl: null,
        }, creator);

        await asyncMap(namespace.users, async (user) => {
          const invitor = owners.find(o => o.username === user.invitor);
          const invitation = await InvitationHelpersService.inviteToNamespace(
            transaction,
            user.email,
            createdNamespace.id,
            invitor.id,
          );

          const invitedOwner = owners.find(o => o.username === user.owner);
          await InvitationHelpersService.acceptInvitation(
            transaction,
            invitation.invitationKey,
            invitedOwner.id,
            user.name,
          );
        });

        await asyncMap(namespace.invitations, async (invitedOnlyUser) => {
          const invitor = owners.find(o => o.username === invitedOnlyUser.invitor);
          await InvitationHelpersService.inviteToNamespace(
            transaction,
            invitedOnlyUser.email,
            createdNamespace.id,
            invitor.id,
          );
        });

        await asyncMap(namespace.paymentEvents, async (paymentEvent) => {
          const creator = owners.find(o => o.username === paymentEvent.owner);
          const namespaceView = await new NamespaceService(LOGGER)
            .getNamespaceViewForOwner(createdNamespace.id, creator.id);

          const userId = namespaceView.ownerUsers
            .find(o => o.name === paymentEvent.user)?.id;

          const pe: PaymentEvent = {
            id: 0,
            created: paymentEvent.data.created,
            edited: paymentEvent.data.edited,
            createdBy: userId,
            editedBy: userId,
            benefitors: paymentEvent.data.benefitors.map(b => ({
              userId: (namespaceView.users.find(u => u.name === b.user)?.id) as number,
              amount: b.amount,
              currency: b.currency,
            })),
            paidBy: paymentEvent.data.paidBy.map(p => ({
              userId: (namespaceView.users.find(u => u.name === p.user)?.id) as number,
              amount: p.amount,
              currency: p.currency,
            })),
            namespaceId: createdNamespace.id,
            settlementId: null,
            description: paymentEvent.data.description,
            notes: paymentEvent.data.notes,
          };

          await new PaymentEventService(LOGGER)
            .addPaymentEventBackdoor(pe);
        });

        return namespace;
      });

      return CYBACKDOOR_SERVICE.load(owners.map(o => o.id));
    });
  },
};
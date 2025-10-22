import { BackdoorLoadData, BackdoorScenarioDataFixed, Owner } from '@angular-monorepo/entities';
import { query } from '../../connection/connection';
import { asyncMap, getRandomColor } from '@angular-monorepo/utils';
import { NamespaceService } from '@angular-monorepo/mysql-adapter';
import { getTransactionContext } from '@angular-monorepo/mysql-adapter';
import { LOGGER } from '../../helpers';
import { AUTHENTICATION } from '../authentication/authentication';
import { randomUUID } from 'crypto';

interface InsertResult {
  insertId: number;
}

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
      // Clean up existing test data
      await query(
        `call testDisposeMultiple('[${scenarioData.owners.map(o => ('"' + o.name + '"')).join(', ')}]')`,
      );

      // Create owners using direct SQL
      const owners: Owner[] = [];
      for (const owner of scenarioData.owners) {
        const avatarColor = getRandomColor();
        const hash = AUTHENTICATION.getPasswordHash(owner.password);
        const ownerKey = randomUUID();

        // Insert Avatar
        const avatarResult = await transaction.query<InsertResult>(
          'INSERT INTO `Avatar` (`color`, `url`) VALUES (?, ?)',
          [avatarColor, null],
        );
        const avatarId = avatarResult.insertId;

        // Insert Owner
        const ownerResult = await transaction.query<InsertResult>(
          'INSERT INTO `Owner` (`key`, `username`, `hash`, `avatarId`) VALUES (?, ?, ?, ?)',
          [ownerKey, owner.name, hash, avatarId],
        );
        const ownerId = ownerResult.insertId;

        owners.push({
          id: ownerId,
          key: ownerKey,
          username: owner.name,
          avatarId: avatarId,
        });
      }

      // Create namespaces with users and payment events
      for (const namespace of scenarioData.namespaces) {
        const creator = owners.find(o => o.username === namespace.creator);
        const avatarColor = getRandomColor();

        // Insert Namespace Avatar
        const namespaceAvatarResult = await transaction.query<InsertResult>(
          'INSERT INTO `Avatar` (`color`, `url`) VALUES (?, ?)',
          [avatarColor, null],
        );
        const namespaceAvatarId = namespaceAvatarResult.insertId;

        // Insert Namespace
        const namespaceResult = await transaction.query<InsertResult>(
          'INSERT INTO `Namespace` (`name`, `avatarId`) VALUES (?, ?)',
          [namespace.name, namespaceAvatarId],
        );
        const namespaceId = namespaceResult.insertId;

        // Insert NamespaceOwner for creator
        await transaction.query(
          'INSERT INTO `NamespaceOwner` (`ownerId`, `namespaceId`) VALUES (?, ?)',
          [creator.id, namespaceId],
        );

        // Insert creator User
        await transaction.query(
          'INSERT INTO `User` (`name`, `namespaceId`, `ownerId`, `avatarId`) VALUES (?, ?, ?, ?)',
          [creator.username, namespaceId, creator.id, creator.avatarId],
        );

        // Track user IDs for payment events
        const userIdMap = new Map<string, number>();
        const creatorUserResult = await transaction.query<Array<{ id: number }>>(
          'SELECT id FROM `User` WHERE `namespaceId` = ? AND `ownerId` = ?',
          [namespaceId, creator.id],
        );
        userIdMap.set(creator.username, creatorUserResult[0].id);

        // Process accepted invitations (users)
        for (const user of namespace.users) {
          const invitor = owners.find(o => o.username === user.invitor);
          const invitedOwner = owners.find(o => o.username === user.owner);
          const invitationKey = randomUUID();

          // Insert accepted Invitation
          await transaction.query(
            `INSERT INTO \`Invitation\` 
            (\`email\`, \`created\`, \`edited\`, \`namespaceId\`, \`createdBy\`, \`editedBy\`, \`accepted\`, \`rejected\`, \`invitationKey\`)
            VALUES (?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), ?, ?, ?, 1, 0, ?)`,
            [user.email, namespaceId, invitor.id, invitor.id, invitationKey],
          );

          // Insert NamespaceOwner for invited user
          await transaction.query(
            'INSERT INTO `NamespaceOwner` (`ownerId`, `namespaceId`) VALUES (?, ?)',
            [invitedOwner.id, namespaceId],
          );

          // Insert User for invited owner
          const invitedUserResult = await transaction.query<InsertResult>(
            'INSERT INTO `User` (`name`, `namespaceId`, `ownerId`, `avatarId`) VALUES (?, ?, ?, ?)',
            [user.name, namespaceId, invitedOwner.id, invitedOwner.avatarId],
          );
          userIdMap.set(user.name, invitedUserResult.insertId);
        }

        // Process unaccepted invitations
        for (const invitation of namespace.invitations) {
          const invitor = owners.find(o => o.username === invitation.invitor);
          const invitationKey = randomUUID();

          // Insert unaccepted Invitation
          await transaction.query(
            `INSERT INTO \`Invitation\` 
            (\`email\`, \`created\`, \`edited\`, \`namespaceId\`, \`createdBy\`, \`editedBy\`, \`accepted\`, \`rejected\`, \`invitationKey\`)
            VALUES (?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), ?, ?, ?, 0, 0, ?)`,
            [invitation.email, namespaceId, invitor.id, invitor.id, invitationKey],
          );
        }

        // Process payment events
        for (const paymentEvent of namespace.paymentEvents) {
          const creatorUserId = userIdMap.get(paymentEvent.user);

          // Insert PaymentEvent
          const paymentEventResult = await transaction.query<InsertResult>(
            `INSERT INTO \`PaymentEvent\` 
            (\`created\`, \`edited\`, \`createdBy\`, \`editedBy\`, \`namespaceId\`, \`settlementId\`, \`description\`, \`notes\`)
            VALUES (?, ?, ?, ?, ?, NULL, ?, ?)`,
            [
              new Date(paymentEvent.data.created),
              new Date(paymentEvent.data.edited),
              creatorUserId,
              creatorUserId,
              namespaceId,
              paymentEvent.data.description,
              paymentEvent.data.notes,
            ],
          );
          const paymentEventId = paymentEventResult.insertId;

          // Insert paidBy nodes
          for (const paidBy of paymentEvent.data.paidBy) {
            const userId = userIdMap.get(paidBy.user);
            await transaction.query(
              'INSERT INTO `PaymentNode` (`paymentEventId`, `userId`, `amount`, `currency`, `type`) VALUES (?, ?, ?, ?, ?)',
              [paymentEventId, userId, paidBy.amount, paidBy.currency, 'P'],
            );
          }

          // Insert benefitor nodes
          for (const benefitor of paymentEvent.data.benefitors) {
            const userId = userIdMap.get(benefitor.user);
            await transaction.query(
              'INSERT INTO `PaymentNode` (`paymentEventId`, `userId`, `amount`, `currency`, `type`) VALUES (?, ?, ?, ?, ?)',
              [paymentEventId, userId, benefitor.amount, benefitor.currency, 'B'],
            );
          }
        }
      }

      return CYBACKDOOR_SERVICE.load(owners.map(o => o.id));
    });
  },
};
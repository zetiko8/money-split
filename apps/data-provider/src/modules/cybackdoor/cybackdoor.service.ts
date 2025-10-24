import { BackdoorLoadData, BackdoorScenarioData, Owner } from '@angular-monorepo/entities';
import { query } from '../../connection/connection';
import { asyncMap, Logger } from '@angular-monorepo/utils';
import { NamespaceService } from '@angular-monorepo/mysql-adapter';
import { getTransactionContext } from '@angular-monorepo/mysql-adapter';

export const CYBACKDOOR_SERVICE = {
  load: async (ownerIds: number[], logger: Logger): Promise<BackdoorLoadData[]> => {

    const result = await asyncMap(ownerIds, async (ownerId) => {
      const namespaces = await new NamespaceService(logger).getNamespacesForOwner(ownerId);

      const namespaceViews = await asyncMap(namespaces, async (namespace) => {
        return new NamespaceService(logger).getNamespaceViewForOwner(namespace.id, ownerId);
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
  createScenario: async (scenarioData: BackdoorScenarioData, logger: Logger) => {
    return await getTransactionContext({ logger}, async (transaction) => {
      logger.log('AB');
      // Clean up existing test data

      try {
        await transaction.query(
          `call testDisposeMultiple('[${scenarioData.owners.map(o => ('"' + o.name + '"')).join(', ')}]')`,
        );
      } catch (error) {
        logger.log('C');
      }

      logger.log('B');

      // We need to import AUTHENTICATION to hash passwords
      const { AUTHENTICATION } = await import('../authentication/authentication');

      // Transform scenario data to include hashed passwords (default to 'testpassword' if not provided)
      const scenarioDataWithHashes = {
        namespaces: scenarioData.namespaces,
        owners: scenarioData.owners.map(owner => ({
          name: owner.name,
          hash: AUTHENTICATION.getPasswordHash(owner.password || 'testpassword'),
        })),
      };

      // Call the stored procedure with JSON data
      const ownerIds = await transaction.jsonProcedure<number[]>(
        'call createScenario(?);',
        [JSON.stringify(scenarioDataWithHashes)],
      );

      return CYBACKDOOR_SERVICE.load(ownerIds, logger);
    });
  },
};
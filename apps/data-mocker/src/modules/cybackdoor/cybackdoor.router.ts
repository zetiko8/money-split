import { Router } from 'express';
import { CYBACKDOOR_SERVICE } from './cybackdoor.service';
import { LOGGER, registerRoute } from '../../helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { createScenarioApiBackdoor, loadApiBackdoor, settleConfirmApiBackdoor, sqlBackdoor } from '@angular-monorepo/api-interface';
import { AUTH_MIDDLEWARE } from '../auth/auth-middleware';
import { getTransactionContext, SettleService } from '@angular-monorepo/mysql-adapter';
import { mysqlDate } from '@angular-monorepo/express-lib';

export const cyBackdoorRouter = Router();

registerRoute(
  settleConfirmApiBackdoor(),
  cyBackdoorRouter,
  async (payload) => {
    return await getTransactionContext({ logger: LOGGER }, async (transaction) => {
    // Validate settledOn date
      if (!payload.settledOn || isNaN(new Date(payload.settledOn).getTime())) {
        throw Error(ERROR_CODE.INVALID_REQUEST);
      }

      const result = await new SettleService(LOGGER)
        .settle(
          payload.userId,
          payload.namespaceId,
          payload,
          payload.ownerId,
        );

      const updateSql = `
    UPDATE \`Settlement\`
    SET created = '${mysqlDate(new Date(payload.settledOn))}',
        edited = '${mysqlDate(new Date(payload.settledOn))}'
    WHERE id = ${result.id}
  `;
      await transaction.query(updateSql);

      return result;
    });
  },
  AUTH_MIDDLEWARE.backdoorAuth,
);

registerRoute(
  sqlBackdoor(),
  cyBackdoorRouter,
  async (payload) => {
    try {
      const result = await getTransactionContext({ logger: LOGGER }, async (transaction) => {
        return await transaction.query(payload.sql);
      });

      return result;
    } catch (error) {
      LOGGER.log('FAILED BACKDOOR QUERY');
      LOGGER.log(payload.sql);
      throw error;
    }
  },
  AUTH_MIDDLEWARE.backdoorAuth,
);

registerRoute(
  loadApiBackdoor(),
  cyBackdoorRouter,
  async (payload) => {
    return await CYBACKDOOR_SERVICE.load(payload);
  },
  AUTH_MIDDLEWARE.backdoorAuth,
);

registerRoute(
  createScenarioApiBackdoor(),
  cyBackdoorRouter,
  async (payload) => {
    return await CYBACKDOOR_SERVICE.createScenario(payload);
  },
  AUTH_MIDDLEWARE.backdoorAuth,
);

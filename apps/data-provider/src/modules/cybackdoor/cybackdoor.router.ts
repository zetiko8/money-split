import { Router } from 'express';
import { CYBACKDOOR_SERVICE } from './cybackdoor.service';
import { LOGGER, registerRoute } from '../../helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { query } from '../../connection/connection';
import { createScenarioApiBackdoor, loadApiBackdoor, settleConfirmApiBackdoor, sqlBackdoor } from '@angular-monorepo/api-interface';
import { AUTH_MIDDLEWARE } from '../auth/auth-middleware';
import { settleRouter } from '../settle/settle.router';
import { SETTLE_SERVICE } from '../settle/settle';
import { mysqlDate } from '../../connection/helper';

export const cyBackdoorRouter = Router();

registerRoute(
  settleConfirmApiBackdoor(),
  settleRouter,
  async (payload) => {

    // Validate settledOn date
    if (!payload.settledOn || isNaN(new Date(payload.settledOn).getTime())) {
      throw Error(ERROR_CODE.INVALID_REQUEST);
    }

    const result = await SETTLE_SERVICE
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
    await query(updateSql);

    return result;
  },
  AUTH_MIDDLEWARE.backdoorAuth,
);

registerRoute(
  sqlBackdoor(),
  cyBackdoorRouter,
  async (payload) => {
    try {
      const result = await query(payload.sql);

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
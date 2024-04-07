import { ERROR_CODE, Invitation, MNamespace, Owner, RecordData, RecordDataCy, User } from '@angular-monorepo/entities';
import { lastInsertId, query } from '../../connection/connection';
import { insertSql, mysqlDate, selectOneWhereSql } from '../../connection/helper';
import { EntityPropertyType, InvitationEntity, RecordEntity } from '../../types';
import { RECORD_SERVICE } from '../record';
import { asyncMap } from '../../helpers';
import { SETTLE_SERVICE } from '../settle';

export const CYBACKDOOR_SERVICE = {
  deleteOwner: async (
    username: string,
  ) => {
    await query(
      `DELETE FROM Owner WHERE username = "${username}"`,
    );
  },
  deleteUser: async (
    username: string,
  ) => {
    await query(
      `DELETE FROM \`User\` WHERE name = "${username}"`,
    );
  },
  deleteNamespaceByName: async (
    namespaceName: string,
  ) => {
    await query(
      `DELETE FROM \`Namespace\`
            WHERE name = "${namespaceName}"
            `,
    );
  },
  getNamespaceByName: async (
    namespaceName: string,
  ) => {
    return (await query<MNamespace>(
      `SELECT * FROM \`Namespace\`
            WHERE name = "${namespaceName}"
            `,
    ))[0];
  },
  deleteInvitationByEmail: async (
    email: string,
  ) => {
    await query(
      `DELETE FROM \`Invitation\`
          WHERE email = "${email}"
          `,
    );
  },
  getOwnerByUsername: async (
    username: string,
  ) => {
    const owner = await query<Owner[]>(`
        SELECT * FROM \`Owner\`
        WHERE \`username\` = "${username}"`);

    if (!owner.length)
      throw Error(ERROR_CODE.RESOURCE_NOT_FOUND);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (owner[0] as any).hash;

    return owner[0];
  },
  getUserByUsername: async (
    username: string,
  ) => {
    const user = await query<User[]>(`
        SELECT * FROM \`User\`
        WHERE \`name\` = "${username}"`);

    if (!user.length)
      throw Error(ERROR_CODE.RESOURCE_NOT_FOUND);

    return user[0];
  },
  getInvitationByEmail: async (
    email: string,
  ) => {
    return await selectOneWhereSql<Invitation>(
      'Invitation',
      'email',
      EntityPropertyType.STRING,
      email,
      InvitationEntity,
    );
  },
  addRecord: async (
    namespaceId: number,
    userId: number,
    data: RecordDataCy,
  ) => {

    const recordData: RecordData = {
      paidBy: (
        await asyncMap(data.paidBy, async (b) => {
          return (await CYBACKDOOR_SERVICE.getUserByUsername(b))
            .id;
        })),
      benefitors: (
        await asyncMap(data.benefitors, async (b) => {
          return (await CYBACKDOOR_SERVICE.getUserByUsername(b))
            .id;
        })),
      cost: data.cost,
      currency: data.currency,
    };

    await query(insertSql(
      'Record',
      RecordEntity,
      {
        created: new Date(data.created),
        edited: new Date(data.edited),
        createdBy: userId,
        editedBy: userId,
        data: recordData,
        namespaceId,
        settlementId: null,
      },
    ));

    const recordId = await lastInsertId();

    return RECORD_SERVICE.getRecordById(recordId);
  },
  settleRecords: async (
    byUser: string,
    namespaceName: string,
    records: number[],
    settledOn: Date,
  ) => {
    const user = await CYBACKDOOR_SERVICE.getUserByUsername(byUser);
    const namespace
      = await CYBACKDOOR_SERVICE.getNamespaceByName(namespaceName);

    const settlement = await SETTLE_SERVICE.settle(
      user.id,
      namespace.id,
      records,
    );

    const updateSql = `
        UPDATE \`Settlement\`
        SET
        created = '${mysqlDate(new Date())}'
        WHERE id = ${settlement.id}
    `;
    await query(updateSql);

    settlement.created = settledOn;
    return settlement;
  },
};
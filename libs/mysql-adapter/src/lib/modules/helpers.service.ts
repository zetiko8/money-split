import { Transaction } from '../mysql-adapter';
import { Owner } from '@angular-monorepo/entities';

export class HelpersService {

  static async getOwnerByKey(
    transaction: Transaction,
    ownerKey: string,
  ) {
    const owner = (await transaction.query<Owner[]>(
      'SELECT * FROM `Owner` WHERE `key` = ?',
      [ownerKey],
    ))[0];
    return owner;
  }

  static async getOwnerFromUsername(
    transaction: Transaction,
    username: string,
  ) {
    const owners = await transaction.query<Owner[]>(`
      SELECT * FROM \`Owner\`
      WHERE \`username\` = ?`,
    [username]);
    return owners[0];
  }
}
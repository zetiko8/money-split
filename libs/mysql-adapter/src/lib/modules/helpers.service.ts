import { Logger } from '@angular-monorepo/utils';
import { getTransaction } from '../mysql-adapter';
import { Owner } from '@angular-monorepo/entities';

export class HelpersService {

  constructor(
    private readonly logger: Logger,
  ) {}

  async getOwnerByKey(
    ownerKey: string,
  ) {
    const transaction = await getTransaction(this.logger);
    const owner = (await transaction.query<Owner[]>(
      'SELECT * FROM `Owner` WHERE `key` = ?',
      [ownerKey],
    ))[0];
    await transaction.commit();
    return owner;
  }
}
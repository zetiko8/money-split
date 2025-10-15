import { IOwnerService } from '@angular-monorepo/data-adapter';
import { getTransactionContext } from '../mysql-adapter';
import { Owner, RegisterOwnerPayload } from '@angular-monorepo/entities';
import { Logger } from '@angular-monorepo/utils';
import { randomUUID } from 'crypto';

export class OwnerService implements IOwnerService {

  constructor(
    private readonly logger: Logger,
  ) {}

  async createOwner(
    payload: RegisterOwnerPayload,
    hash: string,
  ): Promise<Owner> {
    return await getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const result = await transaction.jsonProcedure<Owner>(
          'call createOwner(?, ?, ?, ?, ?);',
          [
            payload.username,
            hash,
            payload.avatarColor,
            payload.avatarUrl,
            randomUUID(),
          ],
        );
        return result;
      });
  }
}

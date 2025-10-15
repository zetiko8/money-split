import { IAvatarService } from '@angular-monorepo/data-adapter';
import { getTransactionContext } from '../mysql-adapter';
import { AvatarData } from '@angular-monorepo/entities';
import { Logger } from '@angular-monorepo/utils';

export class AvatarService implements IAvatarService {

  constructor(
    private readonly logger: Logger,
  ) {}

  getById(id: number): Promise<AvatarData> {
    return getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const result = await transaction.jsonProcedure<AvatarData>(
          'call getAvatarById(?);',
          [
            id,
          ],
        );
        return result;
      });
  }
}

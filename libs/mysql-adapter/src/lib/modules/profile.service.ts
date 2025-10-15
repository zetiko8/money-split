import { IProfileService } from '@angular-monorepo/data-adapter';
import { EditProfileData, OwnerProfileView } from '@angular-monorepo/entities';
import { getTransactionContext } from '../mysql-adapter';
import { Logger } from '@angular-monorepo/utils';

export class ProfileService implements IProfileService {
  constructor(
    private readonly logger: Logger,
  ) {}

  async getProfile (
    ownerId: number,
  ): Promise<OwnerProfileView> {
    return getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const result = await transaction.jsonProcedure<OwnerProfileView>(
          'call getOwnerProfile(?);',
          [
            ownerId,
          ],
        );
        return result;
      });
  }

  async editProfile (
    ownerId: number,
    data: EditProfileData,
  ): Promise<OwnerProfileView> {
    return getTransactionContext(
      { logger: this.logger },
      async (transaction) => {
        const result = await transaction.jsonProcedure<OwnerProfileView>(
          'call editOwnerProfile(?, ?, ?);',
          [
            ownerId,
            data.ownerAvatar.avatarUrl,
            data.ownerAvatar.avatarColor,
          ],
        );
        return result;
      });
  }
};
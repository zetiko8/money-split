import { EditProfileData, OwnerProfileView } from '@angular-monorepo/entities';
import { appErrorWrap } from '../helpers';
import { jsonProcedure } from '../connection/helper';

export const PROFILE_SERVICE = {
  getProfile: async (
    ownerId: number,
  ): Promise<OwnerProfileView> => {
    return await appErrorWrap('getOwnerProfile', async () => {
      return await jsonProcedure<OwnerProfileView>(
        `
        call getOwnerProfile(${ownerId});
        `,
      );
    });
  },
  editProfile: async (
    ownerId: number,
    data: EditProfileData,
  ) => {
    return await appErrorWrap('editOwnerProfile', async () => {
      return await jsonProcedure<OwnerProfileView>(
        `
        call editOwnerProfile(
          ${ownerId},
          ${data.ownerAvatar.avatarUrl ? `'${data.ownerAvatar.avatarUrl}'` : 'NULL'},
          ${data.ownerAvatar.avatarColor ? `'${data.ownerAvatar.avatarColor}'` : 'NULL'}
        );
        `,
      );
    });
  },
};
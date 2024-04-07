import { EditProfileData, OwnerProfileView } from '@angular-monorepo/entities';
import { OWNER_SERVICE } from './owners';
import { AVATAR_SERVICE } from './avatar';
import { USER_SERVICE } from './user';
import { asyncMap } from '../helpers';
import { query } from '../connection/connection';

export const PROFILE_SERVICE = {
  getProfile: async (
    ownerId: number,
  ): Promise<OwnerProfileView> => {
    const result = await query(
      `
      call getOwnerProfile(${ownerId});
      `,
    );

    const profile
      = JSON.parse(result[0][0].jsonResult) as OwnerProfileView;

    if (!profile.users)
      profile.users = [];

    return profile;
  },
  editProfile: async (
    ownerId: number,
    data: EditProfileData,
  ) => {
    const avatar = await AVATAR_SERVICE.createAvatar(
      data.ownerAvatar.avatarColor, data.ownerAvatar.avatarUrl,
    );

    const profile = await PROFILE_SERVICE.getProfile(ownerId);
    const userAvatarsToUpdate = profile.users
      .filter(user => user.avatar.id === profile.avatar.id)
      .map(user => user.user.id);
    await OWNER_SERVICE.updateOwnerAvatar(ownerId, avatar.id);
    await asyncMap(userAvatarsToUpdate, async (userId) => {
      await USER_SERVICE.updateUserAvatar(userId, avatar.id);
    });

    return await PROFILE_SERVICE.getProfile(ownerId);
  },
};
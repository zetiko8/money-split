import { AvatarData } from '@angular-monorepo/entities';
import { selectOneWhereSql } from '../connection/helper';
import { AvatarEntity, EntityPropertyType } from '../types';

export const AVATAR_SERVICE = {
  getById: async (
    id: number,
  ) => {
    const avatar = await selectOneWhereSql<AvatarData>(
      'Avatar',
      'id',
      EntityPropertyType.ID,
      id,
      AvatarEntity,
    );

    return avatar;
  },
};
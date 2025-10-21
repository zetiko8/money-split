import { EditProfileData, OwnerProfileView } from '@angular-monorepo/entities';

export interface IProfileService {
  getProfile (
    ownerId: number,
  ): Promise<OwnerProfileView>;

  editProfile (
    ownerId: number,
    data: EditProfileData,
  ): Promise<OwnerProfileView>;
}
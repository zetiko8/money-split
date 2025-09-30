import { AvatarData } from '@angular-monorepo/entities';

export interface IAvatarService {
  getById(id: number): Promise<AvatarData>;
}

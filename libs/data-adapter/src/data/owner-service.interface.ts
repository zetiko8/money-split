import { Owner, RegisterOwnerPayload } from '@angular-monorepo/entities';

export interface IOwnerService {
  createOwner(payload: RegisterOwnerPayload, hash: string): Promise<Owner>;
}

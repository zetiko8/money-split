export type ValidationErrors = {
 [key: string]: string;
}

export interface AcceptInvitationDataValidationFn {
  (
    invitationKey: string,
    ownerId: number,
    name: string,
  ): Promise<ValidationErrors | null>
}

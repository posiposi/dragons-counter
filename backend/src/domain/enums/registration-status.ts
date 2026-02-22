export const RegistrationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  BANNED: 'BANNED',
} as const;

export type RegistrationStatusType =
  (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

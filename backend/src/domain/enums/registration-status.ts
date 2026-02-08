import { RegistrationStatus as PrismaRegistrationStatus } from '@prisma/client';

export const RegistrationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  BANNED: 'BANNED',

  toPrisma(status: string): PrismaRegistrationStatus {
    const mapping: Record<string, PrismaRegistrationStatus> = {
      PENDING: PrismaRegistrationStatus.PENDING,
      APPROVED: PrismaRegistrationStatus.APPROVED,
      REJECTED: PrismaRegistrationStatus.REJECTED,
      BANNED: PrismaRegistrationStatus.BANNED,
    };
    return mapping[status];
  },

  fromPrisma(prismaStatus: PrismaRegistrationStatus) {
    const mapping = {
      [PrismaRegistrationStatus.PENDING]: 'PENDING',
      [PrismaRegistrationStatus.APPROVED]: 'APPROVED',
      [PrismaRegistrationStatus.REJECTED]: 'REJECTED',
      [PrismaRegistrationStatus.BANNED]: 'BANNED',
    } as const;
    return mapping[prismaStatus];
  },
} as const;

export type RegistrationStatusType = (typeof RegistrationStatus)[keyof Omit<
  typeof RegistrationStatus,
  'toPrisma' | 'fromPrisma'
>];

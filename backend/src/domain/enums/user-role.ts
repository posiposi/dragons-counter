import { UserRole as PrismaUserRole } from '@prisma/client';

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',

  toPrisma(role: string): PrismaUserRole {
    const mapping: Record<string, PrismaUserRole> = {
      USER: PrismaUserRole.USER,
      ADMIN: PrismaUserRole.ADMIN,
    };
    return mapping[role];
  },

  fromPrisma(prismaRole: PrismaUserRole): string {
    const mapping: Record<PrismaUserRole, string> = {
      [PrismaUserRole.USER]: 'USER',
      [PrismaUserRole.ADMIN]: 'ADMIN',
    };
    return mapping[prismaRole];
  },
} as const;

export type UserRoleType = (typeof UserRole)[keyof Omit<
  typeof UserRole,
  'toPrisma' | 'fromPrisma'
>];

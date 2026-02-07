import { UserRole } from './user-role';
import { UserRole as PrismaUserRole } from '@prisma/client';

describe('UserRole', () => {
  describe('values', () => {
    it('should have USER value', () => {
      expect(UserRole.USER).toBe('USER');
    });

    it('should have ADMIN value', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
    });
  });

  describe('toPrisma', () => {
    it('should convert USER to Prisma enum', () => {
      const result = UserRole.toPrisma(UserRole.USER);
      expect(result).toBe(PrismaUserRole.USER);
    });

    it('should convert ADMIN to Prisma enum', () => {
      const result = UserRole.toPrisma(UserRole.ADMIN);
      expect(result).toBe(PrismaUserRole.ADMIN);
    });
  });

  describe('fromPrisma', () => {
    it('should convert Prisma USER to domain enum', () => {
      const result = UserRole.fromPrisma(PrismaUserRole.USER);
      expect(result).toBe(UserRole.USER);
    });

    it('should convert Prisma ADMIN to domain enum', () => {
      const result = UserRole.fromPrisma(PrismaUserRole.ADMIN);
      expect(result).toBe(UserRole.ADMIN);
    });
  });
});

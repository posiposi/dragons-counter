import { RegistrationStatus } from './registration-status';
import { RegistrationStatus as PrismaRegistrationStatus } from '@prisma/client';

describe('RegistrationStatus', () => {
  describe('values', () => {
    it('should have PENDING value', () => {
      expect(RegistrationStatus.PENDING).toBe('PENDING');
    });

    it('should have APPROVED value', () => {
      expect(RegistrationStatus.APPROVED).toBe('APPROVED');
    });

    it('should have REJECTED value', () => {
      expect(RegistrationStatus.REJECTED).toBe('REJECTED');
    });

    it('should have BANNED value', () => {
      expect(RegistrationStatus.BANNED).toBe('BANNED');
    });
  });

  describe('toPrisma', () => {
    it('should convert PENDING to Prisma enum', () => {
      const result = RegistrationStatus.toPrisma(RegistrationStatus.PENDING);
      expect(result).toBe(PrismaRegistrationStatus.PENDING);
    });

    it('should convert APPROVED to Prisma enum', () => {
      const result = RegistrationStatus.toPrisma(RegistrationStatus.APPROVED);
      expect(result).toBe(PrismaRegistrationStatus.APPROVED);
    });

    it('should convert REJECTED to Prisma enum', () => {
      const result = RegistrationStatus.toPrisma(RegistrationStatus.REJECTED);
      expect(result).toBe(PrismaRegistrationStatus.REJECTED);
    });

    it('should convert BANNED to Prisma enum', () => {
      const result = RegistrationStatus.toPrisma(RegistrationStatus.BANNED);
      expect(result).toBe(PrismaRegistrationStatus.BANNED);
    });
  });

  describe('fromPrisma', () => {
    it('should convert Prisma PENDING to domain enum', () => {
      const result = RegistrationStatus.fromPrisma(
        PrismaRegistrationStatus.PENDING,
      );
      expect(result).toBe(RegistrationStatus.PENDING);
    });

    it('should convert Prisma APPROVED to domain enum', () => {
      const result = RegistrationStatus.fromPrisma(
        PrismaRegistrationStatus.APPROVED,
      );
      expect(result).toBe(RegistrationStatus.APPROVED);
    });

    it('should convert Prisma REJECTED to domain enum', () => {
      const result = RegistrationStatus.fromPrisma(
        PrismaRegistrationStatus.REJECTED,
      );
      expect(result).toBe(RegistrationStatus.REJECTED);
    });

    it('should convert Prisma BANNED to domain enum', () => {
      const result = RegistrationStatus.fromPrisma(
        PrismaRegistrationStatus.BANNED,
      );
      expect(result).toBe(RegistrationStatus.BANNED);
    });
  });
});

import { RegistrationStatus } from './registration-status';

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
});

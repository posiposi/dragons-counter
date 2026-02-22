import { UserRole } from './user-role';

describe('UserRole', () => {
  describe('values', () => {
    it('should have USER value', () => {
      expect(UserRole.USER).toBe('USER');
    });

    it('should have ADMIN value', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
    });
  });
});

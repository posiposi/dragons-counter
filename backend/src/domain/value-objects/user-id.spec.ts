import { UserId } from './user-id';

describe('UserId', () => {
  describe('create', () => {
    it('should create a valid UserId with non-empty string', () => {
      const userId = UserId.create('user-id-123');
      expect(userId.value).toBe('user-id-123');
    });

    it('should throw error for empty string', () => {
      expect(() => UserId.create('')).toThrow('User ID cannot be empty');
    });

    it('should throw error for undefined', () => {
      expect(() => UserId.create(undefined as unknown as string)).toThrow(
        'User ID cannot be empty',
      );
    });

    it('should throw error for null', () => {
      expect(() => UserId.create(null as unknown as string)).toThrow(
        'User ID cannot be empty',
      );
    });

    it('should throw error for whitespace only', () => {
      expect(() => UserId.create('   ')).toThrow('User ID cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const userId1 = UserId.create('test-id');
      const userId2 = UserId.create('test-id');
      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false for different values', () => {
      const userId1 = UserId.create('test-id-1');
      const userId2 = UserId.create('test-id-2');
      expect(userId1.equals(userId2)).toBe(false);
    });
  });

  describe('value getter', () => {
    it('should return the internal value', () => {
      const userId = UserId.create('test-value');
      expect(userId.value).toBe('test-value');
    });
  });
});

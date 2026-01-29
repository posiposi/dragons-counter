import { Password } from './password';

describe('Password', () => {
  describe('fromPlainText', () => {
    it('should create a hashed password from plain text', async () => {
      const password = await Password.fromPlainText('myPassword123');
      expect(password.hash).toBeDefined();
      expect(password.hash).not.toBe('myPassword123');
      expect(password.hash.startsWith('$2b$')).toBe(true);
    });

    it('should throw error for empty string', async () => {
      await expect(Password.fromPlainText('')).rejects.toThrow(
        'Password cannot be empty',
      );
    });

    it('should throw error for undefined', async () => {
      await expect(
        Password.fromPlainText(undefined as unknown as string),
      ).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for null', async () => {
      await expect(
        Password.fromPlainText(null as unknown as string),
      ).rejects.toThrow('Password cannot be empty');
    });

    it('should generate different hashes for same password', async () => {
      const password1 = await Password.fromPlainText('samePassword');
      const password2 = await Password.fromPlainText('samePassword');
      expect(password1.hash).not.toBe(password2.hash);
    });
  });

  describe('fromHash', () => {
    it('should create a Password from existing hash', () => {
      const existingHash =
        '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';
      const password = Password.fromHash(existingHash);
      expect(password.hash).toBe(existingHash);
    });

    it('should throw error for empty hash', () => {
      expect(() => Password.fromHash('')).toThrow(
        'Password hash cannot be empty',
      );
    });

    it('should throw error for undefined hash', () => {
      expect(() => Password.fromHash(undefined as unknown as string)).toThrow(
        'Password hash cannot be empty',
      );
    });

    it('should throw error for null hash', () => {
      expect(() => Password.fromHash(null as unknown as string)).toThrow(
        'Password hash cannot be empty',
      );
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const plainText = 'correctPassword123';
      const password = await Password.fromPlainText(plainText);
      const result = await password.compare(plainText);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = await Password.fromPlainText('correctPassword123');
      const result = await password.compare('wrongPassword');
      expect(result).toBe(false);
    });

    it('should work with password restored from hash', async () => {
      const plainText = 'myPassword';
      const originalPassword = await Password.fromPlainText(plainText);
      const restoredPassword = Password.fromHash(originalPassword.hash);
      const result = await restoredPassword.compare(plainText);
      expect(result).toBe(true);
    });
  });

  describe('hash getter', () => {
    it('should return the hashed value', async () => {
      const password = await Password.fromPlainText('testPassword');
      expect(password.hash).toBeDefined();
      expect(typeof password.hash).toBe('string');
    });
  });
});

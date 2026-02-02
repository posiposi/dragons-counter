import { Email } from './email';

describe('Email', () => {
  describe('create', () => {
    it('should create a valid Email with valid email address', () => {
      const email = Email.create('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('should create a valid Email with subdomain', () => {
      const email = Email.create('user@mail.example.com');
      expect(email.value).toBe('user@mail.example.com');
    });

    it('should create a valid Email with plus sign', () => {
      const email = Email.create('user+tag@example.com');
      expect(email.value).toBe('user+tag@example.com');
    });

    it('should throw error for empty string', () => {
      expect(() => Email.create('')).toThrow('Email cannot be empty');
    });

    it('should throw error for undefined', () => {
      expect(() => Email.create(undefined as unknown as string)).toThrow(
        'Email cannot be empty',
      );
    });

    it('should throw error for null', () => {
      expect(() => Email.create(null as unknown as string)).toThrow(
        'Email cannot be empty',
      );
    });

    it('should throw error for invalid email format without @', () => {
      expect(() => Email.create('invalid-email')).toThrow(
        'Invalid email format',
      );
    });

    it('should throw error for invalid email format without domain', () => {
      expect(() => Email.create('user@')).toThrow('Invalid email format');
    });

    it('should throw error for invalid email format without local part', () => {
      expect(() => Email.create('@example.com')).toThrow(
        'Invalid email format',
      );
    });

    it('should throw error for invalid email format with spaces', () => {
      expect(() => Email.create('user @example.com')).toThrow(
        'Invalid email format',
      );
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different values', () => {
      const email1 = Email.create('user1@example.com');
      const email2 = Email.create('user2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('value getter', () => {
    it('should return the internal value', () => {
      const email = Email.create('test@example.com');
      expect(email.value).toBe('test@example.com');
    });
  });
});

import { User } from './user';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { RegistrationStatus } from '../enums/registration-status';

describe('User Entity', () => {
  const createTestPassword = (): Password => {
    return Password.fromHash('$2b$10$hashedpasswordvalue');
  };

  describe('createNew', () => {
    it('should create a new user with PENDING status', async () => {
      const email = Email.create('test@example.com');
      const password = await Password.fromPlainText('password123');

      const user = User.createNew(email, password);

      expect(user.email.equals(email)).toBe(true);
      expect(user.registrationStatus).toBe(RegistrationStatus.PENDING);
      expect(user.id).toBeDefined();
      expect(user.id.value).toBeTruthy();
    });
  });

  describe('fromRepository', () => {
    it('should restore a user from repository data', () => {
      const id = UserId.create('test-user-id');
      const email = Email.create('test@example.com');
      const password = createTestPassword();
      const status = RegistrationStatus.APPROVED;

      const user = User.fromRepository(id, email, password, status);

      expect(user.id.equals(id)).toBe(true);
      expect(user.email.equals(email)).toBe(true);
      expect(user.password).toBe(password);
      expect(user.registrationStatus).toBe(RegistrationStatus.APPROVED);
    });
  });

  describe('canLogin', () => {
    it('should return true when status is APPROVED', () => {
      const user = User.fromRepository(
        UserId.create('test-user-id'),
        Email.create('test@example.com'),
        createTestPassword(),
        RegistrationStatus.APPROVED,
      );

      expect(user.canLogin()).toBe(true);
    });

    it('should return false when status is PENDING', () => {
      const user = User.fromRepository(
        UserId.create('test-user-id'),
        Email.create('test@example.com'),
        createTestPassword(),
        RegistrationStatus.PENDING,
      );

      expect(user.canLogin()).toBe(false);
    });

    it('should return false when status is REJECTED', () => {
      const user = User.fromRepository(
        UserId.create('test-user-id'),
        Email.create('test@example.com'),
        createTestPassword(),
        RegistrationStatus.REJECTED,
      );

      expect(user.canLogin()).toBe(false);
    });

    it('should return false when status is BANNED', () => {
      const user = User.fromRepository(
        UserId.create('test-user-id'),
        Email.create('test@example.com'),
        createTestPassword(),
        RegistrationStatus.BANNED,
      );

      expect(user.canLogin()).toBe(false);
    });
  });
});

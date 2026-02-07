import { Test, TestingModule } from '@nestjs/testing';
import { SigninUsecase } from './signin.usecase';
import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { RegistrationStatus } from '../enums/registration-status';
import { UserNotApprovedException } from '../exceptions/user-not-approved.exception';
import type { TokenServicePort } from '../ports/token-service.port';

describe('SigninUsecase', () => {
  let usecase: SigninUsecase;
  let mockTokenService: { sign: jest.Mock };

  beforeEach(async () => {
    mockTokenService = {
      sign: jest.fn().mockReturnValue('test-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigninUsecase,
        {
          provide: 'TokenServicePort',
          useValue: mockTokenService as TokenServicePort,
        },
      ],
    }).compile();

    usecase = module.get<SigninUsecase>(SigninUsecase);
  });

  describe('execute', () => {
    it('認証済みUserを渡すとaccessTokenを含むオブジェクトが返される', async () => {
      const user = User.fromRepository(
        UserId.create('test-user-id'),
        Email.create('test@example.com'),
        Password.fromHash('hashed-password'),
        RegistrationStatus.APPROVED,
      );

      const result = await usecase.execute(user);

      expect(result).toEqual({ accessToken: 'test-jwt-token' });
    });

    it('TokenServicePort.signが正しいペイロードで呼ばれる', async () => {
      const user = User.fromRepository(
        UserId.create('test-user-id'),
        Email.create('test@example.com'),
        Password.fromHash('hashed-password'),
        RegistrationStatus.APPROVED,
      );

      await usecase.execute(user);

      expect(mockTokenService.sign).toHaveBeenCalledTimes(1);
      expect(mockTokenService.sign).toHaveBeenCalledWith({
        sub: 'test-user-id',
        email: 'test@example.com',
      });
    });

    it('PENDINGステータスのユーザーはUserNotApprovedExceptionがスローされる', async () => {
      const user = User.fromRepository(
        UserId.create('test-user-id'),
        Email.create('test@example.com'),
        Password.fromHash('hashed-password'),
        RegistrationStatus.PENDING,
      );

      await expect(usecase.execute(user)).rejects.toThrow(
        UserNotApprovedException,
      );
      expect(mockTokenService.sign).not.toHaveBeenCalled();
    });

    it('REJECTEDステータスのユーザーはUserNotApprovedExceptionがスローされる', async () => {
      const user = User.fromRepository(
        UserId.create('test-user-id'),
        Email.create('test@example.com'),
        Password.fromHash('hashed-password'),
        RegistrationStatus.REJECTED,
      );

      await expect(usecase.execute(user)).rejects.toThrow(
        UserNotApprovedException,
      );
      expect(mockTokenService.sign).not.toHaveBeenCalled();
    });
  });
});

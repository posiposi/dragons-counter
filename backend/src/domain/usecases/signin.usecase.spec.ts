import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { SigninUsecase } from './signin.usecase';
import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { RegistrationStatus } from '../enums/registration-status';
import { UserRole } from '../enums/user-role';

describe('SigninUsecase', () => {
  let usecase: SigninUsecase;
  let mockJwtService: { sign: jest.Mock };

  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn().mockReturnValue('test-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigninUsecase,
        {
          provide: JwtService,
          useValue: mockJwtService,
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
        UserRole.USER,
      );

      const result = await usecase.execute(user);

      expect(result).toEqual({ accessToken: 'test-jwt-token' });
    });

    it('JwtService.signが正しいペイロードで呼ばれる', async () => {
      const user = User.fromRepository(
        UserId.create('test-user-id'),
        Email.create('test@example.com'),
        Password.fromHash('hashed-password'),
        RegistrationStatus.APPROVED,
        UserRole.USER,
      );

      await usecase.execute(user);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'test-user-id',
        email: 'test@example.com',
      });
    });
  });
});

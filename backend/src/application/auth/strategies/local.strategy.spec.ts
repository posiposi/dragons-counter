import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { User } from '../../../domain/entities/user';
import { UserId } from '../../../domain/value-objects/user-id';
import { Email } from '../../../domain/value-objects/email';
import { Password } from '../../../domain/value-objects/password';
import { RegistrationStatus } from '../../../domain/enums/registration-status';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  const mockUserQueryPort = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: 'UserQueryPort', useValue: mockUserQueryPort },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    jest.clearAllMocks();
  });

  it('APPROVEDユーザーがemail/passwordで認証成功しUserを返す', async () => {
    const user = User.fromRepository(
      UserId.create('user-123'),
      Email.create('test@example.com'),
      Password.fromHash('hashed-password'),
      RegistrationStatus.APPROVED,
    );
    const compareSpy = jest
      .spyOn(user.password, 'compare')
      .mockResolvedValue(true);
    mockUserQueryPort.findByEmail.mockResolvedValue(user);

    const result = await strategy.validate(
      'test@example.com',
      'plain-password',
    );

    expect(result).toBe(user);
    expect(mockUserQueryPort.findByEmail).toHaveBeenCalledTimes(1);
    expect(compareSpy).toHaveBeenCalledWith('plain-password');
  });

  it('メールアドレスに該当するユーザーが存在しない場合UnauthorizedExceptionをスローする', async () => {
    mockUserQueryPort.findByEmail.mockResolvedValue(null);

    await expect(
      strategy.validate('nonexistent@example.com', 'any-password'),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      strategy.validate('nonexistent@example.com', 'any-password'),
    ).rejects.toThrow('メールアドレスまたはパスワードが正しくありません');
  });

  it('パスワードが正しくない場合UnauthorizedExceptionをスローする', async () => {
    const user = User.fromRepository(
      UserId.create('user-123'),
      Email.create('test@example.com'),
      Password.fromHash('hashed-password'),
      RegistrationStatus.APPROVED,
    );
    jest.spyOn(user.password, 'compare').mockResolvedValue(false);
    mockUserQueryPort.findByEmail.mockResolvedValue(user);

    await expect(
      strategy.validate('test@example.com', 'wrong-password'),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      strategy.validate('test@example.com', 'wrong-password'),
    ).rejects.toThrow('メールアドレスまたはパスワードが正しくありません');
  });

  it('PENDINGユーザーの場合UnauthorizedExceptionをスローする', async () => {
    const user = User.fromRepository(
      UserId.create('user-123'),
      Email.create('test@example.com'),
      Password.fromHash('hashed-password'),
      RegistrationStatus.PENDING,
    );
    jest.spyOn(user.password, 'compare').mockResolvedValue(true);
    mockUserQueryPort.findByEmail.mockResolvedValue(user);

    await expect(
      strategy.validate('test@example.com', 'plain-password'),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      strategy.validate('test@example.com', 'plain-password'),
    ).rejects.toThrow('このアカウントはログインが許可されていません');
  });

  it('REJECTEDユーザーの場合UnauthorizedExceptionをスローする', async () => {
    const user = User.fromRepository(
      UserId.create('user-123'),
      Email.create('test@example.com'),
      Password.fromHash('hashed-password'),
      RegistrationStatus.REJECTED,
    );
    jest.spyOn(user.password, 'compare').mockResolvedValue(true);
    mockUserQueryPort.findByEmail.mockResolvedValue(user);

    await expect(
      strategy.validate('test@example.com', 'plain-password'),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      strategy.validate('test@example.com', 'plain-password'),
    ).rejects.toThrow('このアカウントはログインが許可されていません');
  });

  it('BANNEDユーザーの場合UnauthorizedExceptionをスローする', async () => {
    const user = User.fromRepository(
      UserId.create('user-123'),
      Email.create('test@example.com'),
      Password.fromHash('hashed-password'),
      RegistrationStatus.BANNED,
    );
    jest.spyOn(user.password, 'compare').mockResolvedValue(true);
    mockUserQueryPort.findByEmail.mockResolvedValue(user);

    await expect(
      strategy.validate('test@example.com', 'plain-password'),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      strategy.validate('test@example.com', 'plain-password'),
    ).rejects.toThrow('このアカウントはログインが許可されていません');
  });
});

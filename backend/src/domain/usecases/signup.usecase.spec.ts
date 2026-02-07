import { Test, TestingModule } from '@nestjs/testing';
import { SignupUsecase } from './signup.usecase';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { User } from '../entities/user';
import { RegistrationStatus } from '../enums/registration-status';

describe('SignupUsecase', () => {
  let usecase: SignupUsecase;
  let mockUserCommandPort: { save: jest.Mock<Promise<void>, [User]> };
  let mockUserQueryPort: { findByEmail: jest.Mock; findById: jest.Mock };

  beforeEach(async () => {
    mockUserCommandPort = {
      save: jest.fn<Promise<void>, [User]>(),
    };
    mockUserQueryPort = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupUsecase,
        {
          provide: 'UserCommandPort',
          useValue: mockUserCommandPort,
        },
        {
          provide: 'UserQueryPort',
          useValue: mockUserQueryPort,
        },
      ],
    }).compile();

    usecase = module.get<SignupUsecase>(SignupUsecase);
  });

  describe('execute', () => {
    describe('正常系', () => {
      it('新規メールアドレスでユーザー登録に成功する', async () => {
        mockUserQueryPort.findByEmail.mockResolvedValue(null);
        mockUserCommandPort.save.mockResolvedValue(undefined);

        await usecase.execute('test@example.com', 'password123');

        expect(mockUserQueryPort.findByEmail).toHaveBeenCalledTimes(1);
        expect(mockUserCommandPort.save).toHaveBeenCalledTimes(1);
      });

      it('UserCommandPort.saveにPENDINGステータスのUserが渡される', async () => {
        mockUserQueryPort.findByEmail.mockResolvedValue(null);
        mockUserCommandPort.save.mockResolvedValue(undefined);

        await usecase.execute('test@example.com', 'password123');

        const savedUser = mockUserCommandPort.save.mock.calls[0][0];
        expect(savedUser).toBeInstanceOf(User);
        expect(savedUser.email.value).toBe('test@example.com');
        expect(savedUser.registrationStatus).toBe(RegistrationStatus.PENDING);
      });

      it('パスワードがハッシュ化されてUserに設定される', async () => {
        mockUserQueryPort.findByEmail.mockResolvedValue(null);
        mockUserCommandPort.save.mockResolvedValue(undefined);

        await usecase.execute('test@example.com', 'password123');

        const savedUser = mockUserCommandPort.save.mock.calls[0][0];
        expect(savedUser.password.hash).not.toBe('password123');
        const isMatch = await savedUser.password.compare('password123');
        expect(isMatch).toBe(true);
      });
    });

    describe('異常系', () => {
      it('既存メールアドレスで登録を試みた場合UserAlreadyExistsExceptionがスローされる', async () => {
        const existingUser = {} as User;
        mockUserQueryPort.findByEmail.mockResolvedValue(existingUser);

        await expect(
          usecase.execute('existing@example.com', 'password123'),
        ).rejects.toThrow(UserAlreadyExistsException);

        expect(mockUserCommandPort.save).not.toHaveBeenCalled();
      });
    });
  });
});

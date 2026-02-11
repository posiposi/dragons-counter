import { Test, TestingModule } from '@nestjs/testing';
import { GetUsersUsecase } from './get-users.usecase';
import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { RegistrationStatus } from '../enums/registration-status';
import { UserRole } from '../enums/user-role';

describe('GetUsersUsecase', () => {
  let usecase: GetUsersUsecase;
  let mockUserQueryPort: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
  };

  beforeEach(async () => {
    mockUserQueryPort = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersUsecase,
        { provide: 'UserQueryPort', useValue: mockUserQueryPort },
      ],
    }).compile();

    usecase = module.get<GetUsersUsecase>(GetUsersUsecase);
  });

  describe('execute', () => {
    it('ユーザー一覧をUserResponseDto配列で返す', async () => {
      const mockUsers = [
        User.fromRepository(
          UserId.create('user-1'),
          Email.create('user1@example.com'),
          Password.fromHash('hashed-password-1'),
          RegistrationStatus.APPROVED,
          UserRole.ADMIN,
        ),
        User.fromRepository(
          UserId.create('user-2'),
          Email.create('user2@example.com'),
          Password.fromHash('hashed-password-2'),
          RegistrationStatus.PENDING,
          UserRole.USER,
        ),
      ];

      mockUserQueryPort.findAll.mockResolvedValue(mockUsers);

      const result = await usecase.execute();

      expect(result).toEqual([
        {
          id: 'user-1',
          email: 'user1@example.com',
          registrationStatus: 'APPROVED',
          role: 'ADMIN',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          registrationStatus: 'PENDING',
          role: 'USER',
        },
      ]);
      expect(mockUserQueryPort.findAll).toHaveBeenCalledTimes(1);
    });

    it('ユーザーが存在しない場合は空配列を返す', async () => {
      mockUserQueryPort.findAll.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toEqual([]);
      expect(mockUserQueryPort.findAll).toHaveBeenCalledTimes(1);
    });

    it('リポジトリエラーが伝播する', async () => {
      mockUserQueryPort.findAll.mockRejectedValue(new Error('Database error'));

      await expect(usecase.execute()).rejects.toThrow('Database error');
      expect(mockUserQueryPort.findAll).toHaveBeenCalledTimes(1);
    });
  });
});

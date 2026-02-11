import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetCurrentUserUsecase } from './get-current-user.usecase';
import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { RegistrationStatus } from '../enums/registration-status';
import { UserRole } from '../enums/user-role';
import { UserResponseDto } from '../../application/auth/dto/user-response.dto';

describe('GetCurrentUserUsecase', () => {
  let usecase: GetCurrentUserUsecase;
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
        GetCurrentUserUsecase,
        { provide: 'UserQueryPort', useValue: mockUserQueryPort },
      ],
    }).compile();

    usecase = module.get<GetCurrentUserUsecase>(GetCurrentUserUsecase);
  });

  describe('execute', () => {
    it('ユーザーが見つかった場合、UserResponseDtoを返す', async () => {
      const mockUser = User.fromRepository(
        UserId.create('test-user-id'),
        Email.create('test@example.com'),
        Password.fromHash('hashed-password'),
        RegistrationStatus.APPROVED,
        UserRole.USER,
      );

      mockUserQueryPort.findById.mockResolvedValue(mockUser);

      const result = await usecase.execute('test-user-id');

      const expected: UserResponseDto = {
        id: 'test-user-id',
        email: 'test@example.com',
        registrationStatus: 'APPROVED',
        role: 'USER',
      };

      expect(result).toEqual(expected);
      expect(mockUserQueryPort.findById).toHaveBeenCalledTimes(1);
      expect(mockUserQueryPort.findById).toHaveBeenCalledWith(
        UserId.create('test-user-id'),
      );
    });

    it('ユーザーが見つからない場合、NotFoundExceptionをスローする', async () => {
      mockUserQueryPort.findById.mockResolvedValue(null);

      await expect(usecase.execute('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserQueryPort.findById).toHaveBeenCalledTimes(1);
      expect(mockUserQueryPort.findById).toHaveBeenCalledWith(
        UserId.create('nonexistent-id'),
      );
    });

    it('リポジトリエラーが伝播する', async () => {
      mockUserQueryPort.findById.mockRejectedValue(new Error('Database error'));

      await expect(usecase.execute('test-user-id')).rejects.toThrow(
        'Database error',
      );
      expect(mockUserQueryPort.findById).toHaveBeenCalledTimes(1);
    });
  });
});

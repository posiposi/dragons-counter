import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetCurrentUserUsecase } from './get-current-user.usecase';
import { UserQueryPort } from '../ports/user-query.port';
import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { RegistrationStatus } from '../enums/registration-status';
import { UserRole } from '../enums/user-role';
import { UserResponseDto } from '../../application/auth/dto/user-response.dto';

describe('GetCurrentUserUsecase', () => {
  let usecase: GetCurrentUserUsecase;
  let userQueryPort: UserQueryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentUserUsecase,
        {
          provide: 'UserQueryPort',
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<GetCurrentUserUsecase>(GetCurrentUserUsecase);
    userQueryPort = module.get<UserQueryPort>('UserQueryPort');
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

      jest.spyOn(userQueryPort, 'findById').mockResolvedValue(mockUser);

      const result = await usecase.execute('test-user-id');

      const expected: UserResponseDto = {
        id: 'test-user-id',
        email: 'test@example.com',
        registrationStatus: 'APPROVED',
      };

      expect(result).toEqual(expected);
      expect(userQueryPort.findById).toHaveBeenCalledTimes(1);
      expect(userQueryPort.findById).toHaveBeenCalledWith(
        UserId.create('test-user-id'),
      );
    });

    it('ユーザーが見つからない場合、NotFoundExceptionをスローする', async () => {
      jest.spyOn(userQueryPort, 'findById').mockResolvedValue(null);

      await expect(usecase.execute('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(userQueryPort.findById).toHaveBeenCalledTimes(1);
      expect(userQueryPort.findById).toHaveBeenCalledWith(
        UserId.create('nonexistent-id'),
      );
    });

    it('リポジトリエラーが伝播する', async () => {
      const error = new Error('Database error');
      jest.spyOn(userQueryPort, 'findById').mockRejectedValue(error);

      await expect(usecase.execute('test-user-id')).rejects.toThrow(
        'Database error',
      );
      expect(userQueryPort.findById).toHaveBeenCalledTimes(1);
    });
  });
});

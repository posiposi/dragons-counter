import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ApproveUserUsecase } from './approve-user.usecase';
import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { RegistrationStatus } from '../enums/registration-status';
import { UserRole } from '../enums/user-role';
import { InvalidStatusTransitionException } from '../exceptions/invalid-status-transition.exception';

describe('ApproveUserUsecase', () => {
  let usecase: ApproveUserUsecase;
  let mockUserCommandPort: {
    save: jest.Mock;
    updateRegistrationStatus: jest.Mock;
  };
  let mockUserQueryPort: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
  };

  beforeEach(async () => {
    mockUserCommandPort = {
      save: jest.fn(),
      updateRegistrationStatus: jest.fn(),
    };
    mockUserQueryPort = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApproveUserUsecase,
        { provide: 'UserCommandPort', useValue: mockUserCommandPort },
        { provide: 'UserQueryPort', useValue: mockUserQueryPort },
      ],
    }).compile();

    usecase = module.get<ApproveUserUsecase>(ApproveUserUsecase);
  });

  it('PENDINGユーザーを承認できる', async () => {
    const user = User.fromRepository(
      UserId.create('test-user-id'),
      Email.create('test@example.com'),
      Password.fromHash('hashed-password'),
      RegistrationStatus.PENDING,
      UserRole.USER,
    );
    mockUserQueryPort.findById.mockResolvedValue(user);
    mockUserCommandPort.updateRegistrationStatus.mockResolvedValue(
      user.approve(),
    );

    await usecase.execute('test-user-id');

    expect(mockUserQueryPort.findById).toHaveBeenCalledTimes(1);
    expect(mockUserCommandPort.updateRegistrationStatus).toHaveBeenCalledTimes(
      1,
    );
    const updatedUser =
      mockUserCommandPort.updateRegistrationStatus.mock.calls[0][0];
    expect(updatedUser.registrationStatus).toBe(RegistrationStatus.APPROVED);
  });

  it('存在しないユーザーIDでNotFoundExceptionがスローされる', async () => {
    mockUserQueryPort.findById.mockResolvedValue(null);

    await expect(usecase.execute('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
    expect(
      mockUserCommandPort.updateRegistrationStatus,
    ).not.toHaveBeenCalled();
  });

  it('APPROVEDユーザーを承認しようとするとInvalidStatusTransitionExceptionがスローされる', async () => {
    const user = User.fromRepository(
      UserId.create('test-user-id'),
      Email.create('test@example.com'),
      Password.fromHash('hashed-password'),
      RegistrationStatus.APPROVED,
      UserRole.USER,
    );
    mockUserQueryPort.findById.mockResolvedValue(user);

    await expect(usecase.execute('test-user-id')).rejects.toThrow(
      InvalidStatusTransitionException,
    );
    expect(
      mockUserCommandPort.updateRegistrationStatus,
    ).not.toHaveBeenCalled();
  });
});

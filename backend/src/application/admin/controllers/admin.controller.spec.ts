import { RequestMethod } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import {
  GetUsersController,
  GetUserController,
  ApproveUserController,
  RejectUserController,
} from './admin.controller';
import { GetUsersUsecase } from '../../../domain/usecases/get-users.usecase';
import { GetCurrentUserUsecase } from '../../../domain/usecases/get-current-user.usecase';
import { ApproveUserUsecase } from '../../../domain/usecases/approve-user.usecase';
import { RejectUserUsecase } from '../../../domain/usecases/reject-user.usecase';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { UserResponseDto } from '../../auth/dto/user-response.dto';

describe('GetUsersController', () => {
  let controller: GetUsersController;
  let usecase: GetUsersUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetUsersController],
      providers: [
        {
          provide: GetUsersUsecase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<GetUsersController>(GetUsersController);
    usecase = module.get(GetUsersUsecase);
  });

  describe('クラスレベルGuard', () => {
    it('JwtAuthGuardとAdminGuardが適用されている', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        GetUsersController,
      ) as Array<new (...args: unknown[]) => unknown>;

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(2);
      expect(guards[0]).toBe(JwtAuthGuard);
      expect(guards[1]).toBe(AdminGuard);
    });
  });

  describe('getUsers', () => {
    it('GetUsersUsecase.executeを呼び出してユーザー一覧を返す', async () => {
      const mockUsers: UserResponseDto[] = [
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
      ];

      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(mockUsers);

      const result = await controller.getUsers();

      expect(result).toEqual(mockUsers);
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    it('GETメソッドでadmin/usersにマッピングされている', () => {
      const method = Object.getOwnPropertyDescriptor(
        GetUsersController.prototype,
        'getUsers',
      )!.value as (...args: unknown[]) => unknown;
      const path = Reflect.getMetadata('path', method) as string;
      const httpMethod = Reflect.getMetadata('method', method) as RequestMethod;

      expect(path).toBe('users');
      expect(httpMethod).toBe(RequestMethod.GET);
    });
  });
});

describe('GetUserController', () => {
  let controller: GetUserController;
  let usecase: GetCurrentUserUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetUserController],
      providers: [
        {
          provide: GetCurrentUserUsecase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<GetUserController>(GetUserController);
    usecase = module.get(GetCurrentUserUsecase);
  });

  describe('クラスレベルGuard', () => {
    it('JwtAuthGuardとAdminGuardが適用されている', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        GetUserController,
      ) as Array<new (...args: unknown[]) => unknown>;

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(2);
      expect(guards[0]).toBe(JwtAuthGuard);
      expect(guards[1]).toBe(AdminGuard);
    });
  });

  describe('getUser', () => {
    it('GetCurrentUserUsecase.executeにIDを渡してユーザー詳細を返す', async () => {
      const mockUser: UserResponseDto = {
        id: 'user-1',
        email: 'user1@example.com',
        registrationStatus: 'APPROVED',
        role: 'ADMIN',
      };

      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(mockUser);

      const result = await controller.getUser('user-1');

      expect(result).toEqual(mockUser);
      expect(executeSpy).toHaveBeenCalledWith('user-1');
    });

    it('GETメソッドでadmin/users/:idにマッピングされている', () => {
      const method = Object.getOwnPropertyDescriptor(
        GetUserController.prototype,
        'getUser',
      )!.value as (...args: unknown[]) => unknown;
      const path = Reflect.getMetadata('path', method) as string;
      const httpMethod = Reflect.getMetadata('method', method) as RequestMethod;

      expect(path).toBe('users/:id');
      expect(httpMethod).toBe(RequestMethod.GET);
    });
  });
});

describe('ApproveUserController', () => {
  let controller: ApproveUserController;
  let usecase: ApproveUserUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApproveUserController],
      providers: [
        {
          provide: ApproveUserUsecase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ApproveUserController>(ApproveUserController);
    usecase = module.get(ApproveUserUsecase);
  });

  describe('クラスレベルGuard', () => {
    it('JwtAuthGuardとAdminGuardが適用されている', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        ApproveUserController,
      ) as Array<new (...args: unknown[]) => unknown>;

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(2);
      expect(guards[0]).toBe(JwtAuthGuard);
      expect(guards[1]).toBe(AdminGuard);
    });
  });

  describe('approveUser', () => {
    it('ApproveUserUsecase.executeにIDを渡して呼び出す', async () => {
      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(undefined);

      await controller.approveUser('user-1');

      expect(executeSpy).toHaveBeenCalledWith('user-1');
    });

    it('PATCHメソッドでadmin/users/:id/approveにマッピングされている', () => {
      const method = Object.getOwnPropertyDescriptor(
        ApproveUserController.prototype,
        'approveUser',
      )!.value as (...args: unknown[]) => unknown;
      const path = Reflect.getMetadata('path', method) as string;
      const httpMethod = Reflect.getMetadata('method', method) as RequestMethod;

      expect(path).toBe('users/:id/approve');
      expect(httpMethod).toBe(RequestMethod.PATCH);
    });
  });
});

describe('RejectUserController', () => {
  let controller: RejectUserController;
  let usecase: RejectUserUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RejectUserController],
      providers: [
        {
          provide: RejectUserUsecase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<RejectUserController>(RejectUserController);
    usecase = module.get(RejectUserUsecase);
  });

  describe('クラスレベルGuard', () => {
    it('JwtAuthGuardとAdminGuardが適用されている', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        RejectUserController,
      ) as Array<new (...args: unknown[]) => unknown>;

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(2);
      expect(guards[0]).toBe(JwtAuthGuard);
      expect(guards[1]).toBe(AdminGuard);
    });
  });

  describe('rejectUser', () => {
    it('RejectUserUsecase.executeにIDを渡して呼び出す', async () => {
      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(undefined);

      await controller.rejectUser('user-1');

      expect(executeSpy).toHaveBeenCalledWith('user-1');
    });

    it('PATCHメソッドでadmin/users/:id/rejectにマッピングされている', () => {
      const method = Object.getOwnPropertyDescriptor(
        RejectUserController.prototype,
        'rejectUser',
      )!.value as (...args: unknown[]) => unknown;
      const path = Reflect.getMetadata('path', method) as string;
      const httpMethod = Reflect.getMetadata('method', method) as RequestMethod;

      expect(path).toBe('users/:id/reject');
      expect(httpMethod).toBe(RequestMethod.PATCH);
    });
  });
});

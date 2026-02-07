import { RequestMethod } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { MeController } from './me.controller';
import { GetCurrentUserUsecase } from '../../../domain/usecases/get-current-user.usecase';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserResponseDto } from '../dto/user-response.dto';

describe('MeController', () => {
  let controller: MeController;
  let usecase: GetCurrentUserUsecase;

  const meMethod = Object.getOwnPropertyDescriptor(
    MeController.prototype,
    'me',
  )!.value as (...args: unknown[]) => unknown;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeController],
      providers: [
        {
          provide: GetCurrentUserUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MeController>(MeController);
    usecase = module.get<GetCurrentUserUsecase>(GetCurrentUserUsecase);
  });

  describe('me', () => {
    it('GetCurrentUserUsecase.executeにreq.user.userIdを渡してUserResponseDtoを返す', async () => {
      const mockResponse: UserResponseDto = {
        id: 'test-user-id',
        email: 'test@example.com',
        registrationStatus: 'APPROVED',
      };

      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(mockResponse);

      const result = await controller.me({
        user: { userId: 'test-user-id', email: 'test@example.com' },
      });

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual(mockResponse);
    });

    it('JwtAuthGuardが適用されている', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        meMethod,
      ) as Array<new (...args: unknown[]) => unknown>;

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(1);
      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('GETメソッドでauthパス配下のmeにマッピングされている', () => {
      const path = Reflect.getMetadata('path', meMethod) as string;
      const method = Reflect.getMetadata('method', meMethod) as RequestMethod;

      expect(path).toBe('me');
      expect(method).toBe(RequestMethod.GET);
    });
  });
});

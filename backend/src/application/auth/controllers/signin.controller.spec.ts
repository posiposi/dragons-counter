import { Test, TestingModule } from '@nestjs/testing';
import { SigninController } from './signin.controller';
import { SigninUsecase } from '../../../domain/usecases/signin.usecase';

describe('SigninController', () => {
  let controller: SigninController;
  let usecase: SigninUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SigninController],
      providers: [
        {
          provide: SigninUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SigninController>(SigninController);
    usecase = module.get<SigninUsecase>(SigninUsecase);
  });

  describe('signin', () => {
    it('SigninUsecase.executeにreq.userを渡してaccessTokenを返す', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockResult = { accessToken: 'test-jwt-token' };
      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(mockResult);

      const result = await controller.signin(
        { email: 'test@example.com', password: 'password123' },
        { user: mockUser },
      );

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ accessToken: 'test-jwt-token' });
    });
  });
});

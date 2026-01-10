import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetDefaultStadiumController } from './get-default-stadium.controller';
import { GetDefaultStadiumUsecase } from '../../domain/usecases/get-default-stadium.usecase';
import { StadiumResponseDto } from '../dto/response/stadium-response.dto';

describe('GetDefaultStadiumController', () => {
  let controller: GetDefaultStadiumController;
  let usecase: GetDefaultStadiumUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetDefaultStadiumController],
      providers: [
        {
          provide: GetDefaultStadiumUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GetDefaultStadiumController>(
      GetDefaultStadiumController,
    );
    usecase = module.get<GetDefaultStadiumUsecase>(GetDefaultStadiumUsecase);
  });

  describe('getDefaultStadium', () => {
    it('should return default stadium', async () => {
      const mockStadiumDto: StadiumResponseDto = {
        id: 'stadium-1',
        name: 'バンテリンドーム',
        isDefault: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(mockStadiumDto);

      const result = await controller.getDefaultStadium();

      expect(result).toEqual(mockStadiumDto);
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when no default stadium exists', async () => {
      jest
        .spyOn(usecase, 'execute')
        .mockRejectedValue(new NotFoundException('Default stadium not found'));

      await expect(controller.getDefaultStadium()).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

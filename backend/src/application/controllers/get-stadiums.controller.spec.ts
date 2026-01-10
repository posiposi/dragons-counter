import { Test, TestingModule } from '@nestjs/testing';
import { GetStadiumsController } from './get-stadiums.controller';
import { GetStadiumsUsecase } from '../../domain/usecases/get-stadiums.usecase';
import { StadiumResponseDto } from '../dto/response/stadium-response.dto';

describe('GetStadiumsController', () => {
  let controller: GetStadiumsController;
  let usecase: GetStadiumsUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetStadiumsController],
      providers: [
        {
          provide: GetStadiumsUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GetStadiumsController>(GetStadiumsController);
    usecase = module.get<GetStadiumsUsecase>(GetStadiumsUsecase);
  });

  describe('getStadiums', () => {
    it('should return all stadiums', async () => {
      const mockStadiumsDto: StadiumResponseDto[] = [
        {
          id: 'stadium-1',
          name: 'バンテリンドーム',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'stadium-2',
          name: '甲子園',
          isDefault: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(mockStadiumsDto);

      const result = await controller.getStadiums();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockStadiumsDto[0]);
      expect(result[1]).toEqual(mockStadiumsDto[1]);
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no stadiums exist', async () => {
      const executeSpy = jest.spyOn(usecase, 'execute').mockResolvedValue([]);

      const result = await controller.getStadiums();

      expect(result).toEqual([]);
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });
  });
});

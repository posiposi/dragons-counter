import { Test, TestingModule } from '@nestjs/testing';
import { GetStadiumsUsecase } from './get-stadiums.usecase';
import { StadiumPort } from '../ports/stadium.port';
import { Stadium } from '../entities/stadium';
import { StadiumId } from '../value-objects/stadium-id';
import { StadiumName } from '../value-objects/stadium-name';
import { StadiumResponseDto } from '../../application/dto/response/stadium-response.dto';

describe('GetStadiumsUsecase', () => {
  let usecase: GetStadiumsUsecase;
  let stadiumPort: StadiumPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStadiumsUsecase,
        {
          provide: 'StadiumPort',
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<GetStadiumsUsecase>(GetStadiumsUsecase);
    stadiumPort = module.get<StadiumPort>('StadiumPort');
  });

  describe('execute', () => {
    it('should return all stadiums from the repository', async () => {
      const mockStadiums: Stadium[] = [
        new Stadium(
          new StadiumId('stadium-1'),
          new StadiumName('バンテリンドームナゴヤ'),
          true,
          new Date('2025-01-01T00:00:00Z'),
          new Date('2025-01-01T00:00:00Z'),
        ),
        new Stadium(
          new StadiumId('stadium-2'),
          new StadiumName('東京ドーム'),
          false,
          new Date('2025-01-01T00:00:00Z'),
          new Date('2025-01-01T00:00:00Z'),
        ),
      ];

      const findAllSpy = jest
        .spyOn(stadiumPort, 'findAll')
        .mockResolvedValue(mockStadiums);

      const result = await usecase.execute();

      const expectedDto: StadiumResponseDto[] = [
        {
          id: 'stadium-1',
          name: 'バンテリンドームナゴヤ',
          isDefault: true,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'stadium-2',
          name: '東京ドーム',
          isDefault: false,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      expect(result).toEqual(expectedDto);
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no stadiums exist', async () => {
      const findAllSpy = jest
        .spyOn(stadiumPort, 'findAll')
        .mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toEqual([]);
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(stadiumPort, 'findAll').mockRejectedValue(error);

      await expect(usecase.execute()).rejects.toThrow('Database error');
    });
  });
});

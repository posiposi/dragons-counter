import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetDefaultStadiumUsecase } from './get-default-stadium.usecase';
import { StadiumPort } from '../ports/stadium.port';
import { Stadium } from '../entities/stadium';
import { StadiumId } from '../value-objects/stadium-id';
import { StadiumName } from '../value-objects/stadium-name';
import { StadiumResponseDto } from '../../application/dto/response/stadium-response.dto';

describe('GetDefaultStadiumUsecase', () => {
  let usecase: GetDefaultStadiumUsecase;
  let stadiumPort: StadiumPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDefaultStadiumUsecase,
        {
          provide: 'StadiumPort',
          useValue: {
            findDefault: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<GetDefaultStadiumUsecase>(GetDefaultStadiumUsecase);
    stadiumPort = module.get<StadiumPort>('StadiumPort');
  });

  describe('execute', () => {
    it('should return default stadium from the repository', async () => {
      const mockStadium = Stadium.create(
        new StadiumId('stadium-1'),
        new StadiumName('バンテリンドームナゴヤ'),
        true,
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-01-01T00:00:00Z'),
      );

      const findDefaultSpy = jest
        .spyOn(stadiumPort, 'findDefault')
        .mockResolvedValue(mockStadium);

      const result = await usecase.execute();

      const expectedDto: StadiumResponseDto = {
        id: 'stadium-1',
        name: 'バンテリンドームナゴヤ',
        isDefault: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      expect(result).toEqual(expectedDto);
      expect(findDefaultSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when no default stadium exists', async () => {
      jest.spyOn(stadiumPort, 'findDefault').mockResolvedValue(null);

      await expect(usecase.execute()).rejects.toThrow(NotFoundException);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(stadiumPort, 'findDefault').mockRejectedValue(error);

      await expect(usecase.execute()).rejects.toThrow('Database error');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { BulkCreateGameController } from './bulk-create-game.controller';
import {
  BulkCreateGameUsecase,
  BulkCreateGameResult,
} from '../../domain/usecases/bulk-create-game.usecase';
import { BulkCreateGameDto } from '../dto/request/bulk-create-game.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

describe('BulkCreateGameController', () => {
  let controller: BulkCreateGameController;
  let usecase: BulkCreateGameUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulkCreateGameController],
      providers: [
        {
          provide: BulkCreateGameUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BulkCreateGameController>(BulkCreateGameController);
    usecase = module.get<BulkCreateGameUsecase>(BulkCreateGameUsecase);
  });

  describe('bulkCreate', () => {
    const validDto: BulkCreateGameDto = {
      games: [
        {
          gameDate: '2026-04-01',
          opponent: '阪神タイガース',
          dragonsScore: 5,
          opponentScore: 3,
          stadium: 'バンテリンドーム ナゴヤ',
        },
      ],
    };

    it('should successfully create games and return result', async () => {
      const expectedResult: BulkCreateGameResult = {
        savedCount: 1,
        skippedCount: 0,
        errors: [],
      };

      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(expectedResult);

      const result = await controller.bulkCreate(validDto);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(validDto.games);
      expect(result).toEqual(expectedResult);
    });

    it('should return result with skipped games when duplicates exist', async () => {
      const expectedResult: BulkCreateGameResult = {
        savedCount: 0,
        skippedCount: 1,
        errors: [],
      };

      jest.spyOn(usecase, 'execute').mockResolvedValue(expectedResult);

      const result = await controller.bulkCreate(validDto);

      expect(result.skippedCount).toBe(1);
      expect(result.savedCount).toBe(0);
    });

    it('should return result with errors when save fails for some games', async () => {
      const expectedResult: BulkCreateGameResult = {
        savedCount: 0,
        skippedCount: 0,
        errors: ['Failed to save game for 2026-04-01: Database error'],
      };

      jest.spyOn(usecase, 'execute').mockResolvedValue(expectedResult);

      const result = await controller.bulkCreate(validDto);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to save game');
    });

    it('should throw InternalServerErrorException when usecase throws unexpected error', async () => {
      jest
        .spyOn(usecase, 'execute')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(controller.bulkCreate(validDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  it('JwtAuthGuardとAdminGuardがクラスレベルで適用されている', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      BulkCreateGameController,
    ) as Array<new (...args: unknown[]) => unknown>;

    expect(guards).toBeDefined();
    expect(guards).toHaveLength(2);
    expect(guards[0]).toBe(JwtAuthGuard);
    expect(guards[1]).toBe(AdminGuard);
  });
});

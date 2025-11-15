import { Test, TestingModule } from '@nestjs/testing';
import { CreateGameController } from './create-game.controller';
import { CreateGameUseCase } from '../../domain/usecases/create-game.usecase';
import { CreateGameRequest } from '../dto/request/create-game.dto';
import { Game } from '../../domain/entities/game';
import { GameId } from '../../domain/value-objects/game-id';
import { GameDate } from '../../domain/value-objects/game-date';
import { Opponent } from '../../domain/value-objects/opponent';
import { Score } from '../../domain/value-objects/score';
import { Stadium } from '../../domain/value-objects/stadium';
import { Notes } from '../../domain/value-objects/notes';
import { randomUUID } from 'crypto';

describe('CreateGameController', () => {
  let controller: CreateGameController;
  let createGameUseCase: jest.Mocked<CreateGameUseCase>;

  beforeEach(async () => {
    const mockCreateGameUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateGameController],
      providers: [
        {
          provide: CreateGameUseCase,
          useValue: mockCreateGameUseCase,
        },
      ],
    }).compile();

    controller = module.get<CreateGameController>(CreateGameController);
    createGameUseCase = module.get(CreateGameUseCase);
  });

  describe('create', () => {
    const testCases = [
      {
        description: 'should create a game with WIN result',
        dto: {
          gameDate: '2024-04-01',
          opponent: '横浜DeNAベイスターズ',
          dragonsScore: 5,
          opponentScore: 3,
          stadium: 'バンテリンドーム',
          notes: '開幕戦で勝利！',
        },
      },
      {
        description: 'should create a game with LOSE result',
        dto: {
          gameDate: '2024-04-02',
          opponent: '阪神タイガース',
          dragonsScore: 2,
          opponentScore: 7,
          stadium: '甲子園',
          notes: '大敗',
        },
      },
      {
        description: 'should create a game with DRAW result',
        dto: {
          gameDate: '2024-04-03',
          opponent: '広島東洋カープ',
          dragonsScore: 4,
          opponentScore: 4,
          stadium: 'マツダスタジアム',
          notes: '引き分け',
        },
      },
      {
        description: 'should create a game without notes',
        dto: {
          gameDate: '2024-04-04',
          opponent: '東京ヤクルトスワローズ',
          dragonsScore: 6,
          opponentScore: 2,
          stadium: 'バンテリンドーム',
        },
      },
    ];

    test.each(testCases)('$description', async ({ dto }) => {
      const gameId = new GameId(randomUUID());
      const expectedGame = new Game(
        gameId,
        new GameDate(new Date(dto.gameDate)),
        new Opponent(dto.opponent),
        new Score(dto.dragonsScore),
        new Score(dto.opponentScore),
        new Stadium(dto.stadium),
        dto.notes ? new Notes(dto.notes) : undefined,
        new Date(),
        new Date(),
      );

      createGameUseCase.execute.mockResolvedValue(expectedGame);

      const result = await controller.create(dto as CreateGameRequest);

      expect(result).toEqual({
        id: expectedGame.id.value,
        gameDate: expectedGame.gameDate.value.toISOString().split('T')[0],
        opponent: expectedGame.opponent.value,
        dragonsScore: expectedGame.dragonsScore.value,
        opponentScore: expectedGame.opponentScore.value,
        result: expectedGame.result.value,
        stadium: expectedGame.stadium.value,
        notes: expectedGame.notes?.value || null,
        createdAt: expectedGame.createdAt.toISOString(),
        updatedAt: expectedGame.updatedAt.toISOString(),
      });
    });

    it('should handle use case errors', async () => {
      const dto: CreateGameRequest = {
        gameDate: '2024-04-01',
        opponent: '横浜DeNAベイスターズ',
        dragonsScore: 5,
        opponentScore: 3,
        stadium: 'バンテリンドーム',
        notes: '開幕戦で勝利！',
      };

      const error = new Error('Use case error');
      createGameUseCase.execute.mockRejectedValue(error);

      await expect(controller.create(dto)).rejects.toThrow('Use case error');
    });
  });
});

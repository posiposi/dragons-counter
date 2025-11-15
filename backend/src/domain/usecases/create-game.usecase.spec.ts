import { CreateGameUseCase } from './create-game.usecase';
import { Game } from '../entities/game';
import { GameResultValue } from '../value-objects/game-result';
import { GameDate } from '../value-objects/game-date';
import { GameId } from '../value-objects/game-id';
import { Opponent } from '../value-objects/opponent';
import { Score } from '../value-objects/score';
import { Stadium } from '../value-objects/stadium';
import { Notes } from '../value-objects/notes';
import { GamePort } from '../ports/game.port';
import { CreateGameRequest } from '../../application/dto/request/create-game.dto';

describe('CreateGameUseCase', () => {
  let useCase: CreateGameUseCase;
  let mockPort: jest.Mocked<GamePort>;

  beforeEach(() => {
    mockPort = {
      save: jest.fn(),
    };
    useCase = new CreateGameUseCase(mockPort);
  });

  describe('execute', () => {
    describe.each([
      {
        description: 'Dragons win game',
        dragonsScore: 5,
        opponentScore: 3,
        expectedResult: GameResultValue.WIN,
      },
      {
        description: 'Dragons lose game',
        dragonsScore: 2,
        opponentScore: 4,
        expectedResult: GameResultValue.LOSE,
      },
      {
        description: 'Draw game',
        dragonsScore: 3,
        opponentScore: 3,
        expectedResult: GameResultValue.DRAW,
      },
    ])('$description', ({ dragonsScore, opponentScore, expectedResult }) => {
      it(`should create and save a game with result ${expectedResult}`, async () => {
        const request: CreateGameRequest = {
          gameDate: '2024-01-15',
          opponent: '阪神タイガース',
          dragonsScore,
          opponentScore,
          stadium: 'バンテリンドーム ナゴヤ',
          notes: '素晴らしい試合でした',
        };

        const mockSavedGame = new Game(
          new GameId('test-id'),
          new GameDate(new Date('2024-01-15')),
          new Opponent('阪神タイガース'),
          new Score(dragonsScore),
          new Score(opponentScore),
          new Stadium('バンテリンドーム ナゴヤ'),
          new Notes('素晴らしい試合でした'),
          new Date(),
          new Date(),
        );

        mockPort.save.mockResolvedValue(mockSavedGame);

        const result = await useCase.execute(request);

        expect(result).toBe(mockSavedGame);
        expect(result.result.value).toBe(expectedResult);
      });
    });

    describe.each([
      {
        description: 'notes provided',
        notes: '素晴らしい試合でした',
        expectedNotes: '素晴らしい試合でした',
      },
      {
        description: 'notes not provided',
        notes: undefined,
        expectedNotes: null,
      },
    ])('when $description', ({ notes, expectedNotes }) => {
      it(`should create a game with ${expectedNotes === null ? 'null' : 'provided'} notes`, async () => {
        const request: CreateGameRequest = {
          gameDate: '2024-01-15',
          opponent: '阪神タイガース',
          dragonsScore: 5,
          opponentScore: 3,
          stadium: 'バンテリンドーム ナゴヤ',
          ...(notes && { notes }),
        };

        const mockSavedGame = new Game(
          new GameId('test-id'),
          new GameDate(new Date('2024-01-15')),
          new Opponent('阪神タイガース'),
          new Score(5),
          new Score(3),
          new Stadium('バンテリンドーム ナゴヤ'),
          new Notes(expectedNotes),
          new Date(),
          new Date(),
        );

        mockPort.save.mockResolvedValue(mockSavedGame);

        const result = await useCase.execute(request);

        expect(result).toBe(mockSavedGame);
      });
    });

    describe('error cases', () => {
      it.each([
        {
          description: 'invalid date format',
          gameDate: 'invalid-date',
          expectedError: 'Invalid date format',
        },
        {
          description: 'future date',
          gameDate: (() => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            return futureDate.toISOString().split('T')[0];
          })(),
          expectedError: 'Game date cannot be in the future',
        },
      ])(
        'should throw an error when $description',
        async ({ gameDate, expectedError }) => {
          const request: CreateGameRequest = {
            gameDate,
            opponent: '阪神タイガース',
            dragonsScore: 5,
            opponentScore: 3,
            stadium: 'バンテリンドーム ナゴヤ',
          };

          await expect(() => useCase.execute(request)).rejects.toThrow(
            expectedError,
          );
        },
      );

      it('should throw an error when repository save fails', async () => {
        const request: CreateGameRequest = {
          gameDate: '2024-01-15',
          opponent: '阪神タイガース',
          dragonsScore: 5,
          opponentScore: 3,
          stadium: 'バンテリンドーム ナゴヤ',
        };

        mockPort.save.mockRejectedValue(new Error('Database error'));

        await expect(() => useCase.execute(request)).rejects.toThrow(
          'Database error',
        );
      });
    });
  });
});

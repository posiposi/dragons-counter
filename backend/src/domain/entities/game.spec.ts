import { Game } from './game';
import { GameId } from '../value-objects/game-id';
import { GameDate } from '../value-objects/game-date';
import { Opponent } from '../value-objects/opponent';
import { Score } from '../value-objects/score';
import { Stadium } from '../value-objects/stadium';
import { Notes } from '../value-objects/notes';
import { GameResultValue } from '../value-objects/game-result';

describe('Game Entity', () => {
  const validGameData = {
    id: new GameId('test-id'),
    gameDate: new GameDate(new Date('2024-08-01')),
    opponent: new Opponent('読売ジャイアンツ'),
    dragonsScore: new Score(5),
    opponentScore: new Score(3),
    stadium: new Stadium('バンテリンドーム ナゴヤ'),
    notes: new Notes('素晴らしい試合でした'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createGame = (
    overrides: Partial<{
      id: GameId;
      gameDate: GameDate;
      opponent: Opponent;
      dragonsScore: Score;
      opponentScore: Score;
      stadium: Stadium;
      notes: Notes;
      createdAt: Date;
      updatedAt: Date;
    }> = {},
  ): Game => {
    const data = { ...validGameData, ...overrides };
    return new Game(
      data.id,
      data.gameDate,
      data.opponent,
      data.dragonsScore,
      data.opponentScore,
      data.stadium,
      data.notes,
      data.createdAt,
      data.updatedAt,
    );
  };

  describe('constructor', () => {
    it('should create a valid game entity', () => {
      const game = createGame();

      expect(game.id).toBe(validGameData.id);
      expect(game.opponent).toBe(validGameData.opponent);
      expect(game.dragonsScore).toBe(validGameData.dragonsScore);
      expect(game.opponentScore).toBe(validGameData.opponentScore);
      expect(game.result.value).toBe(GameResultValue.WIN);
      expect(game.stadium).toBe(validGameData.stadium);
    });

    it('should automatically determine WIN result when dragons score is higher', () => {
      const game = createGame({
        dragonsScore: new Score(7),
        opponentScore: new Score(3),
      });
      expect(game.result.value).toBe(GameResultValue.WIN);
    });

    it('should automatically determine LOSE result when opponent score is higher', () => {
      const game = createGame({
        dragonsScore: new Score(2),
        opponentScore: new Score(5),
      });
      expect(game.result.value).toBe(GameResultValue.LOSE);
    });

    it('should automatically determine DRAW result when scores are equal', () => {
      const game = createGame({
        dragonsScore: new Score(4),
        opponentScore: new Score(4),
      });
      expect(game.result.value).toBe(GameResultValue.DRAW);
    });

    it('should throw error for future game date', () => {
      expect(() => {
        createGame({
          gameDate: new GameDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        });
      }).toThrow('Game date cannot be in the future');
    });
  });

  describe('isVictory', () => {
    test.each([
      ['winning game', new Score(5), new Score(3), true],
      ['losing game', new Score(2), new Score(4), false],
      ['draw game', new Score(3), new Score(3), false],
    ])(
      'should return %s for dragons:%s vs opponent:%s',
      (_, dragonsScore, opponentScore, expected) => {
        const game = createGame({
          dragonsScore,
          opponentScore,
        });

        expect(game.isVictory()).toBe(expected);
      },
    );
  });
});

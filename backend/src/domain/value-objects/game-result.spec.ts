import { GameResult, GameResultValue } from './game-result';

describe('GameResult', () => {
  describe('constructor', () => {
    test.each([
      [GameResultValue.WIN],
      [GameResultValue.LOSE],
      [GameResultValue.DRAW],
    ])('should create GameResult with value %s', (value) => {
      const result = new GameResult(value);
      expect(result.value).toBe(value);
    });
  });

  describe('fromScores', () => {
    test.each([
      [5, 3, GameResultValue.WIN],
      [2, 4, GameResultValue.LOSE],
      [3, 3, GameResultValue.DRAW],
      [10, 0, GameResultValue.WIN],
      [0, 10, GameResultValue.LOSE],
      [0, 0, GameResultValue.DRAW],
    ])(
      'should return correct result for dragons:%d vs opponent:%d',
      (dragonsScore, opponentScore, expectedResult) => {
        const result = GameResult.fromScores(dragonsScore, opponentScore);
        expect(result.value).toBe(expectedResult);
      },
    );
  });

  describe('isWin', () => {
    test.each([
      [GameResultValue.WIN, true],
      [GameResultValue.LOSE, false],
      [GameResultValue.DRAW, false],
    ])('should return correct boolean for %s', (value, expected) => {
      const result = new GameResult(value);
      expect(result.isWin()).toBe(expected);
    });
  });
});

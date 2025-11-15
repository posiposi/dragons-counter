import { GameId } from './game-id';

describe('GameId', () => {
  describe('constructor', () => {
    it('should create a valid GameId with non-empty string', () => {
      const gameId = new GameId('test-id-123');
      expect(gameId.value).toBe('test-id-123');
    });

    it('should throw error for empty string', () => {
      expect(() => new GameId('')).toThrow('Game ID cannot be empty');
    });

    it('should throw error for undefined', () => {
      expect(() => new GameId(undefined as unknown as string)).toThrow(
        'Game ID cannot be empty',
      );
    });

    it('should throw error for null', () => {
      expect(() => new GameId(null as unknown as string)).toThrow(
        'Game ID cannot be empty',
      );
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const gameId1 = new GameId('test-id');
      const gameId2 = new GameId('test-id');
      expect(gameId1.equals(gameId2)).toBe(true);
    });

    it('should return false for different values', () => {
      const gameId1 = new GameId('test-id-1');
      const gameId2 = new GameId('test-id-2');
      expect(gameId1.equals(gameId2)).toBe(false);
    });
  });

  describe('value getter', () => {
    it('should return the internal value', () => {
      const gameId = new GameId('test-value');
      expect(gameId.value).toBe('test-value');
    });
  });
});

import { GameDate } from './game-date';

describe('GameDate', () => {
  describe('constructor', () => {
    it('should create a valid game date for past date', () => {
      const date = new Date('2024-08-01');
      const gameDate = new GameDate(date);
      expect(gameDate.value.toISOString().split('T')[0]).toBe('2024-08-01');
    });

    it('should create a valid game date for today', () => {
      const today = new Date();
      const gameDate = new GameDate(today);
      expect(gameDate.value.toDateString()).toBe(today.toDateString());
    });

    it('should throw error for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(() => new GameDate(futureDate)).toThrow(
        'Game date cannot be in the future',
      );
    });
  });

  describe('format', () => {
    test.each([
      [new Date('2024-08-01'), '2024-08-01'],
      [new Date('2024-01-05'), '2024-01-05'],
      [new Date('2024-12-31'), '2024-12-31'],
      [new Date('2024-10-10'), '2024-10-10'],
    ])('should format %s as %s', (date, expected) => {
      const gameDate = new GameDate(date);
      expect(gameDate.format()).toBe(expected);
    });
  });
});

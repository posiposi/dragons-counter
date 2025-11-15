import { Opponent } from './opponent';

describe('Opponent', () => {
  describe('constructor', () => {
    it('should create a valid Opponent with non-empty string', () => {
      const opponent = new Opponent('阪神タイガース');
      expect(opponent.value).toBe('阪神タイガース');
    });

    it('should create a valid Opponent with English team name', () => {
      const opponent = new Opponent('Giants');
      expect(opponent.value).toBe('Giants');
    });

    it('should throw error for empty string', () => {
      expect(() => new Opponent('')).toThrow('Opponent name cannot be empty');
    });

    it('should throw error for whitespace only', () => {
      expect(() => new Opponent('   ')).toThrow(
        'Opponent name cannot be empty',
      );
    });

    it('should throw error for undefined', () => {
      expect(() => new Opponent(undefined as unknown as string)).toThrow(
        'Opponent name cannot be empty',
      );
    });

    it('should throw error for null', () => {
      expect(() => new Opponent(null as unknown as string)).toThrow(
        'Opponent name cannot be empty',
      );
    });

    it('should trim whitespace', () => {
      const opponent = new Opponent('  中日ドラゴンズ  ');
      expect(opponent.value).toBe('中日ドラゴンズ');
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const opponent1 = new Opponent('読売ジャイアンツ');
      const opponent2 = new Opponent('読売ジャイアンツ');
      expect(opponent1.equals(opponent2)).toBe(true);
    });

    it('should return false for different values', () => {
      const opponent1 = new Opponent('阪神タイガース');
      const opponent2 = new Opponent('広島カープ');
      expect(opponent1.equals(opponent2)).toBe(false);
    });

    it('should return true for same values with different whitespace', () => {
      const opponent1 = new Opponent('横浜DeNAベイスターズ');
      const opponent2 = new Opponent('  横浜DeNAベイスターズ  ');
      expect(opponent1.equals(opponent2)).toBe(true);
    });
  });

  describe('value getter', () => {
    it('should return the internal value', () => {
      const opponent = new Opponent('ヤクルトスワローズ');
      expect(opponent.value).toBe('ヤクルトスワローズ');
    });
  });
});

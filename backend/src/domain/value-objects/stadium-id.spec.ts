import { StadiumId } from './stadium-id';

describe('StadiumId', () => {
  describe('constructor', () => {
    it('should create a valid StadiumId with non-empty string', () => {
      const stadiumId = new StadiumId('test-id-123');
      expect(stadiumId.value).toBe('test-id-123');
    });

    it('should throw error for empty string', () => {
      expect(() => new StadiumId('')).toThrow('Stadium ID cannot be empty');
    });

    it('should throw error for whitespace only string', () => {
      expect(() => new StadiumId('   ')).toThrow('Stadium ID cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const stadiumId1 = new StadiumId('test-id');
      const stadiumId2 = new StadiumId('test-id');
      expect(stadiumId1.equals(stadiumId2)).toBe(true);
    });

    it('should return false for different values', () => {
      const stadiumId1 = new StadiumId('test-id-1');
      const stadiumId2 = new StadiumId('test-id-2');
      expect(stadiumId1.equals(stadiumId2)).toBe(false);
    });
  });

  describe('value getter', () => {
    it('should return the internal value', () => {
      const stadiumId = new StadiumId('test-value');
      expect(stadiumId.value).toBe('test-value');
    });
  });
});

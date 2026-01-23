import { StadiumId } from './stadium-id';

describe('StadiumId', () => {
  describe('create', () => {
    it('should create a valid StadiumId with non-empty string', () => {
      const stadiumId = StadiumId.create('stadium-id-123');
      expect(stadiumId.value).toBe('stadium-id-123');
    });

    it('should throw error for empty string', () => {
      expect(() => StadiumId.create('')).toThrow('Stadium ID cannot be empty');
    });

    it('should throw error for whitespace only string', () => {
      expect(() => StadiumId.create('   ')).toThrow(
        'Stadium ID cannot be empty',
      );
    });

    it('should throw error for undefined', () => {
      expect(() => StadiumId.create(undefined as unknown as string)).toThrow(
        'Stadium ID cannot be empty',
      );
    });

    it('should throw error for null', () => {
      expect(() => StadiumId.create(null as unknown as string)).toThrow(
        'Stadium ID cannot be empty',
      );
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const stadiumId1 = StadiumId.create('stadium-id');
      const stadiumId2 = StadiumId.create('stadium-id');
      expect(stadiumId1.equals(stadiumId2)).toBe(true);
    });

    it('should return false for different values', () => {
      const stadiumId1 = StadiumId.create('stadium-id-1');
      const stadiumId2 = StadiumId.create('stadium-id-2');
      expect(stadiumId1.equals(stadiumId2)).toBe(false);
    });
  });

  describe('value getter', () => {
    it('should return the internal value', () => {
      const stadiumId = StadiumId.create('test-value');
      expect(stadiumId.value).toBe('test-value');
    });
  });
});

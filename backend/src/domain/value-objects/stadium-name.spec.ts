import { StadiumName } from './stadium-name';

describe('StadiumName', () => {
  describe('create', () => {
    it('should create a valid StadiumName with non-empty string', () => {
      const stadiumName = StadiumName.create('バンテリンドーム ナゴヤ');
      expect(stadiumName.value).toBe('バンテリンドーム ナゴヤ');
    });

    it('should create a valid StadiumName with English stadium name', () => {
      const stadiumName = StadiumName.create('Tokyo Dome');
      expect(stadiumName.value).toBe('Tokyo Dome');
    });

    it('should throw error for empty string', () => {
      expect(() => StadiumName.create('')).toThrow(
        'Stadium name cannot be empty',
      );
    });

    it('should throw error for whitespace only', () => {
      expect(() => StadiumName.create('   ')).toThrow(
        'Stadium name cannot be empty',
      );
    });

    it('should throw error for undefined', () => {
      expect(() => StadiumName.create(undefined as unknown as string)).toThrow(
        'Stadium name cannot be empty',
      );
    });

    it('should throw error for null', () => {
      expect(() => StadiumName.create(null as unknown as string)).toThrow(
        'Stadium name cannot be empty',
      );
    });

    it('should trim whitespace', () => {
      const stadiumName = StadiumName.create('  甲子園球場  ');
      expect(stadiumName.value).toBe('甲子園球場');
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const stadiumName1 = StadiumName.create('東京ドーム');
      const stadiumName2 = StadiumName.create('東京ドーム');
      expect(stadiumName1.equals(stadiumName2)).toBe(true);
    });

    it('should return false for different values', () => {
      const stadiumName1 = StadiumName.create('東京ドーム');
      const stadiumName2 = StadiumName.create('横浜スタジアム');
      expect(stadiumName1.equals(stadiumName2)).toBe(false);
    });

    it('should return true for same values with different whitespace', () => {
      const stadiumName1 = StadiumName.create('神宮球場');
      const stadiumName2 = StadiumName.create('  神宮球場  ');
      expect(stadiumName1.equals(stadiumName2)).toBe(true);
    });
  });

  describe('value getter', () => {
    it('should return the internal value', () => {
      const stadiumName = StadiumName.create('マツダスタジアム');
      expect(stadiumName.value).toBe('マツダスタジアム');
    });
  });
});

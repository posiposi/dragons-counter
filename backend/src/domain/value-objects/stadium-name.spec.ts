import { StadiumName } from './stadium-name';

describe('StadiumName', () => {
  describe('constructor', () => {
    it('should create a valid StadiumName', () => {
      const stadiumName = new StadiumName('バンテリンドームナゴヤ');
      expect(stadiumName.value).toBe('バンテリンドームナゴヤ');
    });

    it('should throw error for empty string', () => {
      expect(() => new StadiumName('')).toThrow('Stadium name cannot be empty');
    });

    it('should throw error for whitespace only string', () => {
      expect(() => new StadiumName('   ')).toThrow(
        'Stadium name cannot be empty',
      );
    });

    it('should trim whitespace from name', () => {
      const stadiumName = new StadiumName('  東京ドーム  ');
      expect(stadiumName.value).toBe('東京ドーム');
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const name1 = new StadiumName('甲子園球場');
      const name2 = new StadiumName('甲子園球場');
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different values', () => {
      const name1 = new StadiumName('甲子園球場');
      const name2 = new StadiumName('東京ドーム');
      expect(name1.equals(name2)).toBe(false);
    });

    it('should return false for null', () => {
      const name = new StadiumName('甲子園球場');
      expect(name.equals(null as unknown as StadiumName)).toBe(false);
    });

    it('should return false for undefined', () => {
      const name = new StadiumName('甲子園球場');
      expect(name.equals(undefined as unknown as StadiumName)).toBe(false);
    });
  });
});

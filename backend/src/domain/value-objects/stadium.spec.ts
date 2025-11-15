import { Stadium } from './stadium';

describe('Stadium', () => {
  describe('constructor', () => {
    describe('valid values', () => {
      it.each([
        ['バンテリンドーム'],
        ['東京ドーム'],
        ['甲子園球場'],
        ['Nagoya Dome'],
      ])('should create a valid Stadium with %p', (value) => {
        const stadium = new Stadium(value);
        expect(stadium.value).toBe(value);
      });

      it('should trim whitespace', () => {
        const stadium = new Stadium('  マツダスタジアム  ');
        expect(stadium.value).toBe('マツダスタジアム');
      });
    });

    describe('invalid values', () => {
      it.each([
        ['', 'Stadium name cannot be empty'],
        ['   ', 'Stadium name cannot be empty'],
        [undefined, 'Stadium name cannot be empty'],
        [null, 'Stadium name cannot be empty'],
      ])('should throw error for %p', (value, expectedError) => {
        expect(() => new Stadium(value as unknown as string)).toThrow(
          expectedError,
        );
      });
    });
  });

  describe('equals', () => {
    it.each([
      ['神宮球場', '神宮球場', true],
      ['横浜スタジアム', 'ほっともっとフィールド', false],
      ['京セラドーム', '  京セラドーム  ', true],
    ])('should return %s for %p and %p', (value1, value2, expected) => {
      const stadium1 = new Stadium(value1);
      const stadium2 = new Stadium(value2);
      expect(stadium1.equals(stadium2)).toBe(expected);
    });
  });

  describe('value getter', () => {
    it('should return the internal value', () => {
      const stadium = new Stadium('楽天モバイルパーク');
      expect(stadium.value).toBe('楽天モバイルパーク');
    });
  });
});

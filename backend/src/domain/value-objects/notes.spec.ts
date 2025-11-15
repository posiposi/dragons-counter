import { Notes } from './notes';

describe('Notes', () => {
  describe('constructor', () => {
    describe('valid values', () => {
      it.each([
        ['素晴らしい試合でした'],
        ['Great game today!'],
        [''],
        [undefined],
        [null],
      ])('should create a valid Notes with %p', (value) => {
        const notes = new Notes(value);
        if (value === undefined || value === null || value === '') {
          expect(notes.isEmpty()).toBe(true);
          expect(notes.value).toBeUndefined();
        } else {
          expect(notes.isEmpty()).toBe(false);
          expect(notes.value).toBe(value);
        }
      });

      it('should trim whitespace for non-empty values', () => {
        const notes = new Notes('  今日は勝利！  ');
        expect(notes.value).toBe('今日は勝利！');
      });

      it('should treat whitespace-only as empty', () => {
        const notes = new Notes('   ');
        expect(notes.isEmpty()).toBe(true);
        expect(notes.value).toBeUndefined();
      });
    });
  });

  describe('equals', () => {
    it.each([
      ['メモ1', 'メモ1', true],
      ['メモ1', 'メモ2', false],
      [undefined, undefined, true],
      [null, null, true],
      ['', '', true],
      [undefined, null, true],
      [undefined, '', true],
      [null, '', true],
      ['メモ', undefined, false],
      ['  メモ  ', 'メモ', true],
    ])('should return %s for %p and %p', (value1, value2, expected) => {
      const notes1 = new Notes(value1);
      const notes2 = new Notes(value2);
      expect(notes1.equals(notes2)).toBe(expected);
    });
  });

  describe('isEmpty', () => {
    it.each([
      [undefined, true],
      [null, true],
      ['', true],
      ['   ', true],
      ['メモ', false],
    ])('should return %s for %p', (value, expected) => {
      const notes = new Notes(value);
      expect(notes.isEmpty()).toBe(expected);
    });
  });

  describe('value getter', () => {
    it.each([
      ['試合メモ', '試合メモ'],
      [undefined, undefined],
      [null, undefined],
      ['', undefined],
    ])('should return %s for input %p', (input, expected) => {
      const notes = new Notes(input);
      expect(notes.value).toBe(expected);
    });
  });
});

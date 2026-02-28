import { Impression } from './impression';

describe('Impression', () => {
  describe('create', () => {
    it('有効な文字列で生成できる', () => {
      const impression = Impression.create('素晴らしい試合でした');
      expect(impression.value).toBe('素晴らしい試合でした');
    });

    it('null/undefined/空文字列はundefinedとして扱う', () => {
      expect(Impression.create(null).value).toBeUndefined();
      expect(Impression.create(undefined).value).toBeUndefined();
      expect(Impression.create('').value).toBeUndefined();
    });

    it('前後の空白をトリムする', () => {
      const impression = Impression.create('  感動した試合  ');
      expect(impression.value).toBe('感動した試合');
    });

    it('空白のみの文字列はundefinedとして扱う', () => {
      const impression = Impression.create('   ');
      expect(impression.value).toBeUndefined();
      expect(impression.isEmpty()).toBe(true);
    });

    it('191文字を超える文字列で例外がスローされる', () => {
      const longString = 'あ'.repeat(192);
      expect(() => Impression.create(longString)).toThrow(
        'Impression must be 191 characters or less',
      );
    });

    it('191文字ちょうどの文字列で生成できる', () => {
      const maxString = 'あ'.repeat(191);
      const impression = Impression.create(maxString);
      expect(impression.value).toBe(maxString);
    });
  });

  describe('equals', () => {
    it('undefined同士が等価である', () => {
      const impression1 = Impression.create(undefined);
      const impression2 = Impression.create(null);
      expect(impression1.equals(impression2)).toBe(true);
    });

    it('値ありとundefinedが非等価である', () => {
      const impression1 = Impression.create('良い試合');
      const impression2 = Impression.create(undefined);
      expect(impression1.equals(impression2)).toBe(false);
    });

    it('トリム後の値で等価性を比較する', () => {
      const impression1 = Impression.create('  良い試合  ');
      const impression2 = Impression.create('良い試合');
      expect(impression1.equals(impression2)).toBe(true);
    });
  });
});

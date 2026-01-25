export class Opponent {
  private static readonly ABBREVIATION_MAP: Record<string, string> = {
    巨: '読売ジャイアンツ',
    神: '阪神タイガース',
    広: '広島東洋カープ',
    De: '横浜DeNAベイスターズ',
    ヤ: '東京ヤクルトスワローズ',
    中: '中日ドラゴンズ',
    オ: 'オリックス・バファローズ',
    ソ: '福岡ソフトバンクホークス',
    楽: '東北楽天ゴールデンイーグルス',
    西: '埼玉西武ライオンズ',
    ロ: '千葉ロッテマリーンズ',
    日: '北海道日本ハムファイターズ',
  };

  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Opponent name cannot be empty');
    }
    const trimmed = value.trim();
    this._value = Opponent.ABBREVIATION_MAP[trimmed] ?? trimmed;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Opponent): boolean {
    return this._value === other._value;
  }
}

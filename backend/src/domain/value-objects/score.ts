export class Score {
  private readonly _value: number;

  constructor(value: number) {
    if (value === undefined || value === null || Number.isNaN(value)) {
      throw new Error('Score must be a valid number');
    }
    if (!Number.isInteger(value)) {
      throw new Error('Score must be an integer');
    }
    if (value < 0) {
      throw new Error('Score cannot be negative');
    }
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  equals(other: Score): boolean {
    return this._value === other._value;
  }
}

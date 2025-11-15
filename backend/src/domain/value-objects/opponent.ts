export class Opponent {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Opponent name cannot be empty');
    }
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: Opponent): boolean {
    return this._value === other._value;
  }
}

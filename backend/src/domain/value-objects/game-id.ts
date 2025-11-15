export class GameId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Game ID cannot be empty');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: GameId): boolean {
    return this._value === other._value;
  }
}

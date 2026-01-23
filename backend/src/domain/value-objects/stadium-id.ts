export class StadiumId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): StadiumId {
    if (!value || value.trim() === '') {
      throw new Error('Stadium ID cannot be empty');
    }
    return new StadiumId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: StadiumId): boolean {
    return this._value === other._value;
  }
}

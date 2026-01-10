export class StadiumId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Stadium ID cannot be empty');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: StadiumId): boolean {
    if (other == null) {
      return false;
    }
    return this._value === other._value;
  }
}

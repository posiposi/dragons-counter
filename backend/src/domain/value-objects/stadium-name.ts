export class StadiumName {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): StadiumName {
    if (!value || value.trim() === '') {
      throw new Error('Stadium name cannot be empty');
    }
    return new StadiumName(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: StadiumName): boolean {
    return this._value === other._value;
  }
}

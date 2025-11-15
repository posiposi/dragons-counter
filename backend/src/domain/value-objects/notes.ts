export class Notes {
  private readonly _value: string | undefined;

  constructor(value: string | undefined | null) {
    if (value === null || value === undefined || value.trim() === '') {
      this._value = undefined;
    } else {
      this._value = value.trim();
    }
  }

  get value(): string | undefined {
    return this._value;
  }

  isEmpty(): boolean {
    return this._value === undefined;
  }

  equals(other: Notes): boolean {
    return this._value === other._value;
  }
}

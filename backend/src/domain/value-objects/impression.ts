export class Impression {
  private readonly _value: string | undefined;

  private constructor(value: string | undefined | null) {
    if (value === null || value === undefined || value.trim() === '') {
      this._value = undefined;
    } else {
      const trimmed = value.trim();
      if (trimmed.length > 191) {
        throw new Error('Impression must be 191 characters or less');
      }
      this._value = trimmed;
    }
  }

  static create(value: string | undefined | null): Impression {
    return new Impression(value);
  }

  get value(): string | undefined {
    return this._value;
  }

  isEmpty(): boolean {
    return this._value === undefined;
  }

  equals(other: Impression): boolean {
    return this._value === other._value;
  }
}

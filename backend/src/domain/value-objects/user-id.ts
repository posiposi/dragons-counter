export class UserId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): UserId {
    if (!value || value.trim() === '') {
      throw new Error('User ID cannot be empty');
    }
    return new UserId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserId): boolean {
    return this._value === other._value;
  }
}

export class UserGameId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): UserGameId {
    if (!value || value.trim() === '') {
      throw new Error('UserGame ID cannot be empty');
    }
    return new UserGameId(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserGameId): boolean {
    return this._value === other._value;
  }
}

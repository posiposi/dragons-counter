export class Email {
  private readonly _value: string;

  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): Email {
    if (!value || value.trim() === '') {
      throw new Error('Email cannot be empty');
    }
    if (!Email.EMAIL_REGEX.test(value)) {
      throw new Error('Invalid email format');
    }
    return new Email(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}

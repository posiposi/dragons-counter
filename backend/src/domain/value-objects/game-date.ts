export class GameDate {
  private readonly _value: Date;

  constructor(value: Date) {
    this._value = new Date(value);
    this.validate();
  }

  private validate(): void {
    if (this._value > new Date()) {
      throw new Error('Game date cannot be in the future');
    }
  }

  get value(): Date {
    return new Date(this._value);
  }

  format(): string {
    const year = this._value.getFullYear();
    const month = String(this._value.getMonth() + 1).padStart(2, '0');
    const day = String(this._value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

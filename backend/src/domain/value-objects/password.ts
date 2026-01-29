import * as bcrypt from 'bcrypt';

export class Password {
  private readonly _hash: string;

  private static readonly SALT_ROUNDS = 10;

  private constructor(hash: string) {
    this._hash = hash;
  }

  static async fromPlainText(plainText: string): Promise<Password> {
    if (!plainText || plainText.trim() === '') {
      throw new Error('Password cannot be empty');
    }
    const hash = await bcrypt.hash(plainText, Password.SALT_ROUNDS);
    return new Password(hash);
  }

  static fromHash(hash: string): Password {
    if (!hash || hash.trim() === '') {
      throw new Error('Password hash cannot be empty');
    }
    return new Password(hash);
  }

  async compare(plainText: string): Promise<boolean> {
    return bcrypt.compare(plainText, this._hash);
  }

  get hash(): string {
    return this._hash;
  }
}

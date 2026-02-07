export interface TokenServicePort {
  sign(payload: { sub: string; email: string }): string;
}

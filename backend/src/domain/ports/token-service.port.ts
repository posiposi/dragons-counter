export interface TokenServicePort {
  sign(payload: { sub: string; email: string; role: string }): string;
  verify(token: string): { sub: string; email: string; role: string };
}

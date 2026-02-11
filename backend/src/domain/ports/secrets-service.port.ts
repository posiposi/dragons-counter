export interface SecretsServicePort {
  getSecretValue(secretId: string): Promise<string>;
}

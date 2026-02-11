import { Injectable } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import type { SecretsServicePort } from '../../../domain/ports/secrets-service.port';

@Injectable()
export class SecretsServiceAdapter implements SecretsServicePort {
  private readonly client: SecretsManagerClient | null;
  private readonly cache: Map<string, string> = new Map();

  constructor() {
    this.client =
      process.env.NODE_ENV === 'production'
        ? new SecretsManagerClient({
            region: process.env.AWS_REGION || 'ap-northeast-1',
          })
        : null;
  }

  async getSecretValue(secretId: string): Promise<string> {
    const cached = this.cache.get(secretId);
    if (cached) return cached;

    if (this.client) {
      const command = new GetSecretValueCommand({ SecretId: secretId });
      const response = await this.client.send(command);
      const value = response.SecretString;
      if (!value) throw new Error(`Secret ${secretId} has no value`);
      this.cache.set(secretId, value);
      return value;
    }

    const envValue = process.env.API_GATEWAY_API_KEY;
    if (envValue) return envValue;
    throw new Error(`Secret ${secretId} not found in environment variables`);
  }
}

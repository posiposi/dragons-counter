import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import {
  GameEntity,
  StadiumEntity,
  UserEntity,
  UserRegistrationRequestEntity,
} from './entities';

function parseUrl(databaseUrl: string): URL {
  try {
    return new URL(databaseUrl);
  } catch {
    throw new Error('Invalid DATABASE_URL format');
  }
}

export function createDataSourceOptions(
  databaseUrl: string,
): MysqlConnectionOptions {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const parsed = parseUrl(databaseUrl);

  return {
    type: 'mysql',
    host: parsed.hostname,
    port: Number(parsed.port) || 3306,
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    entities: [
      GameEntity,
      StadiumEntity,
      UserEntity,
      UserRegistrationRequestEntity,
    ],
    synchronize: false,
    logging: false,
  };
}

const databaseUrl = process.env.DATABASE_URL ?? '';

export const dataSourceOptions = createDataSourceOptions(databaseUrl);

export default new DataSource(dataSourceOptions);

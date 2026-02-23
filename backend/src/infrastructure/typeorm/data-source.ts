import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import {
  GameEntity,
  StadiumEntity,
  UserEntity,
  UserRegistrationRequestEntity,
  UserGameEntity,
} from './entities';
import { InitialSchema1771806609856 } from './migrations/1771806609856-InitialSchema';
import { AddUsersGamesTable1771816990589 } from './migrations/1771816990589-AddUsersGamesTable';

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
      UserGameEntity,
    ],
    migrations: [InitialSchema1771806609856, AddUsersGamesTable1771816990589],
    synchronize: false,
    logging: false,
  };
}

const databaseUrl = process.env.DATABASE_URL ?? '';

export const dataSourceOptions = createDataSourceOptions(databaseUrl);

export default new DataSource(dataSourceOptions);

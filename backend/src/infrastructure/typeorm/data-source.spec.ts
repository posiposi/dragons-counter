import { createDataSourceOptions } from './data-source';
import {
  GameEntity,
  StadiumEntity,
  UserEntity,
  UserRegistrationRequestEntity,
  UsersGamesEntity,
} from './entities';
import { InitialSchema1771806609856 } from './migrations/1771806609856-InitialSchema';

describe('createDataSourceOptions', () => {
  const url = 'mysql://dragons_user:dragons_password@db:3306/dragons_counter';

  it('DATABASE_URLからMySQL接続設定をパースする', () => {
    const options = createDataSourceOptions(url);

    expect(options.type).toBe('mysql');
    expect(options.host).toBe('db');
    expect(options.port).toBe(3306);
    expect(options.username).toBe('dragons_user');
    expect(options.password).toBe('dragons_password');
    expect(options.database).toBe('dragons_counter');
  });

  it('synchronizeがfalseに設定される', () => {
    const options = createDataSourceOptions(url);

    expect(options.synchronize).toBe(false);
  });

  it('entitiesに全エンティティが登録される', () => {
    const options = createDataSourceOptions(url);

    expect(options.entities).toHaveLength(5);
    expect(options.entities).toContain(UsersGamesEntity);
    expect(options.entities).toEqual([
      GameEntity,
      StadiumEntity,
      UserEntity,
      UserRegistrationRequestEntity,
      UsersGamesEntity,
    ]);
  });

  it('テスト用DATABASE_URLをパースできる', () => {
    const testUrl =
      'mysql://dragons_user:dragons_password@test-db:3306/dragons_counter_test';
    const options = createDataSourceOptions(testUrl);

    expect(options.host).toBe('test-db');
    expect(options.database).toBe('dragons_counter_test');
  });

  it('migrationsに初期マイグレーションが登録される', () => {
    const options = createDataSourceOptions(url);

    expect(options.migrations).toEqual([InitialSchema1771806609856]);
  });

  it('loggingがfalseに設定される', () => {
    const options = createDataSourceOptions(url);

    expect(options.logging).toBe(false);
  });

  it('空文字列の場合にエラーをスローする', () => {
    expect(() => createDataSourceOptions('')).toThrow(
      'DATABASE_URL is required',
    );
  });

  it('不正なURLの場合に認証情報を含まないエラーメッセージをスローする', () => {
    const invalidUrl = 'not-a-valid-url-with-secret';

    let thrownError: Error | undefined;
    try {
      createDataSourceOptions(invalidUrl);
    } catch (error) {
      thrownError = error as Error;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError!.message).toBe('Invalid DATABASE_URL format');
    expect(thrownError!.message).not.toContain(invalidUrl);
  });
});

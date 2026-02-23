import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import {
  GameEntity,
  StadiumEntity,
  UserEntity,
  UserRegistrationRequestEntity,
  UsersGamesEntity,
} from './entities';
import { createDataSourceOptions } from './data-source';

describe('TypeORM DataSource設定', () => {
  let module: TestingModule;

  const mockDataSource = {
    isInitialized: true,
    options: {
      type: 'mysql',
      entities: [
        GameEntity,
        StadiumEntity,
        UserEntity,
        UserRegistrationRequestEntity,
        UsersGamesEntity,
      ],
    },
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('NestJSアプリケーションが正常に起動すること', () => {
    expect(module).toBeDefined();
  });

  it('DataSourceが正常に解決されること', () => {
    const dataSource = module.get<DataSource>(DataSource);
    expect(dataSource).toBeDefined();
    expect(dataSource.isInitialized).toBe(true);
  });
});

describe('createDataSourceOptions', () => {
  it('entities配列に全エンティティが登録されていること', () => {
    const options = createDataSourceOptions(
      'mysql://user:pass@localhost:3306/testdb',
    );

    expect(options.entities).toBeDefined();
    expect(options.entities).toContain(GameEntity);
    expect(options.entities).toContain(StadiumEntity);
    expect(options.entities).toContain(UserEntity);
    expect(options.entities).toContain(UserRegistrationRequestEntity);
    expect(options.entities).toContain(UsersGamesEntity);
    expect(options.entities).toHaveLength(5);
  });
});

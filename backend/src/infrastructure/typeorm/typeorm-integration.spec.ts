import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import {
  GameEntity,
  StadiumEntity,
  UserEntity,
  UserRegistrationRequestEntity,
} from './entities';
import { createDataSourceOptions } from './data-source';

describe('TypeORMとPrismaの並行動作', () => {
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
      ],
    },
    destroy: jest.fn(),
  };

  const prismaServiceMock = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();
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

  it('PrismaClientが正常に解決されること', () => {
    const prismaClient = module.get<PrismaClient>(PrismaClient);
    expect(prismaClient).toBeDefined();
  });

  it('DataSourceとPrismaClientが同時に解決できること', () => {
    const dataSource = module.get<DataSource>(DataSource);
    const prismaClient = module.get<PrismaClient>(PrismaClient);

    expect(dataSource).toBeDefined();
    expect(prismaClient).toBeDefined();
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
    expect(options.entities).toHaveLength(4);
  });
});

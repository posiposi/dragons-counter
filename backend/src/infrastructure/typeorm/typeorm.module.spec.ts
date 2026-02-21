import { Test, TestingModule } from '@nestjs/testing';
import { TypeormModule } from './typeorm.module';
import { DataSource } from 'typeorm';

describe('TypeormModule', () => {
  let module: TestingModule;

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('DataSourceが解決される', async () => {
    module = await Test.createTestingModule({
      imports: [TypeormModule],
    }).compile();

    const dataSource = module.get<DataSource>(DataSource);
    expect(dataSource).toBeDefined();
  });
});

import { DataSource, Repository } from 'typeorm';
import { StadiumEntity } from '../entities/stadium.entity';
import { seedStadiums } from './stadium.seed';

describe('seedStadiums', () => {
  let mockDataSource: Partial<DataSource>;
  let mockRepository: Partial<Repository<StadiumEntity>>;
  let mockQueryBuilder: Record<string, jest.Mock>;
  let capturedValues: Array<Record<string, unknown>>;

  beforeEach(() => {
    capturedValues = [];

    mockQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest
        .fn()
        .mockImplementation(
          (data: Record<string, unknown> | Array<Record<string, unknown>>) => {
            if (Array.isArray(data)) {
              capturedValues.push(...data);
            } else {
              capturedValues.push(data);
            }
            return mockQueryBuilder;
          },
        ),
      orUpdate: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };

    mockRepository = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValue(
          mockQueryBuilder,
        ) as unknown as Repository<StadiumEntity>['createQueryBuilder'],
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };
  });

  it('12件のスタジアムを一括upsertすること', async () => {
    await seedStadiums(mockDataSource as DataSource);

    expect(mockDataSource.getRepository).toHaveBeenCalledWith(StadiumEntity);
    expect(mockQueryBuilder.execute).toHaveBeenCalledTimes(1);
    expect(capturedValues).toHaveLength(12);
  });

  it('idを衝突キーとしてnameとupdated_atのみ更新対象とすること', async () => {
    await seedStadiums(mockDataSource as DataSource);

    expect(mockQueryBuilder.orUpdate).toHaveBeenCalledWith(
      ['name', 'updated_at'],
      ['id'],
    );
  });

  it('タイムスタンプを含むデータをinsertすること', async () => {
    await seedStadiums(mockDataSource as DataSource);

    expect(capturedValues[0]).toEqual(
      expect.objectContaining({
        name: 'バンテリンドーム ナゴヤ',
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      }),
    );
  });

  it('全スタジアム名が含まれること', async () => {
    await seedStadiums(mockDataSource as DataSource);

    const insertedNames = capturedValues.map((r) => r.name);

    expect(insertedNames).toContain('バンテリンドーム ナゴヤ');
    expect(insertedNames).toContain('神宮球場');
    expect(insertedNames).toContain('甲子園球場');
    expect(insertedNames).toContain('エスコンフィールド北海道');
  });
});

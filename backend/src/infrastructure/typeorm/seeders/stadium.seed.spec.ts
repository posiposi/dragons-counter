import { DataSource, Repository } from 'typeorm';
import { StadiumEntity } from '../entities/stadium.entity';
import { seedStadiums } from './stadium.seed';

describe('seedStadiums', () => {
  let mockDataSource: Partial<DataSource>;
  let mockRepository: Partial<Repository<StadiumEntity>>;

  beforeEach(() => {
    mockRepository = {
      upsert: jest.fn().mockResolvedValue(undefined),
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };
  });

  it('should upsert 12 stadiums', async () => {
    await seedStadiums(mockDataSource as DataSource);

    expect(mockDataSource.getRepository).toHaveBeenCalledWith(StadiumEntity);
    expect(mockRepository.upsert).toHaveBeenCalledTimes(12);
  });

  it('should upsert with conflictPaths on name and include timestamps', async () => {
    await seedStadiums(mockDataSource as DataSource);

    expect(mockRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'バンテリンドーム ナゴヤ',
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      }),
      { conflictPaths: ['name'] },
    );
  });

  it('should include all expected stadium names', async () => {
    await seedStadiums(mockDataSource as DataSource);

    const upsertedNames = (mockRepository.upsert as jest.Mock).mock.calls.map(
      (call: [{ name: string }, unknown]) => call[0].name,
    );

    expect(upsertedNames).toContain('バンテリンドーム ナゴヤ');
    expect(upsertedNames).toContain('神宮球場');
    expect(upsertedNames).toContain('甲子園球場');
    expect(upsertedNames).toContain('エスコンフィールド北海道');
  });
});

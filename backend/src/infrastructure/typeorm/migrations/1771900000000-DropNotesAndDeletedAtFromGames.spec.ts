import { QueryRunner } from 'typeorm';
import { DropNotesAndDeletedAtFromGames1771900000000 } from './1771900000000-DropNotesAndDeletedAtFromGames';

describe('DropNotesAndDeletedAtFromGames1771900000000', () => {
  let migration: DropNotesAndDeletedAtFromGames1771900000000;
  let queryFn: jest.Mock;
  let queryRunner: QueryRunner;

  beforeEach(() => {
    migration = new DropNotesAndDeletedAtFromGames1771900000000();
    queryFn = jest.fn().mockResolvedValue(undefined);
    queryRunner = { query: queryFn } as unknown as QueryRunner;
  });

  it('nameプロパティにクラス名とタイムスタンプが設定される', () => {
    expect(migration.name).toBe('DropNotesAndDeletedAtFromGames1771900000000');
  });

  it('upメソッドでnotesカラムとdeleted_atカラムがDROPされる', async () => {
    await migration.up(queryRunner);

    expect(queryFn).toHaveBeenCalledTimes(2);
    expect(queryFn).toHaveBeenCalledWith(
      'ALTER TABLE `games` DROP COLUMN `notes`',
    );
    expect(queryFn).toHaveBeenCalledWith(
      'ALTER TABLE `games` DROP COLUMN `deleted_at`',
    );
  });

  it('downメソッドでnotesカラムとdeleted_atカラムが復元される', async () => {
    await migration.down(queryRunner);

    expect(queryFn).toHaveBeenCalledTimes(2);
    expect(queryFn).toHaveBeenCalledWith(
      'ALTER TABLE `games` ADD COLUMN `notes` varchar(191) NULL',
    );
    expect(queryFn).toHaveBeenCalledWith(
      'ALTER TABLE `games` ADD COLUMN `deleted_at` datetime(6) NULL',
    );
  });
});

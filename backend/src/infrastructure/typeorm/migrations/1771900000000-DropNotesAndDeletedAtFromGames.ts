import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropNotesAndDeletedAtFromGames1771900000000
  implements MigrationInterface
{
  name = 'DropNotesAndDeletedAtFromGames1771900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `games` DROP COLUMN `notes`');
    await queryRunner.query('ALTER TABLE `games` DROP COLUMN `deleted_at`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `games` ADD COLUMN `notes` varchar(191) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `games` ADD COLUMN `deleted_at` datetime(6) NULL',
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersGamesTable1771816990589 implements MigrationInterface {
  name = 'AddUsersGamesTable1771816990589';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users_games\` (\`id\` varchar(191) NOT NULL, \`user_id\` varchar(191) NOT NULL, \`game_id\` varchar(191) NOT NULL, \`impression\` varchar(191) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`UQ_users_games_user_game\` (\`user_id\`, \`game_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_games\` ADD CONSTRAINT \`FK_32e6fd6c60456d11f4fd948d4de\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_games\` ADD CONSTRAINT \`FK_5709157a2bef3e8657f721c4734\` FOREIGN KEY (\`game_id\`) REFERENCES \`games\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users_games\` DROP FOREIGN KEY \`FK_5709157a2bef3e8657f721c4734\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_games\` DROP FOREIGN KEY \`FK_32e6fd6c60456d11f4fd948d4de\``,
    );
    await queryRunner.query(
      `DROP INDEX \`UQ_users_games_user_game\` ON \`users_games\``,
    );
    await queryRunner.query(`DROP TABLE \`users_games\``);
  }
}

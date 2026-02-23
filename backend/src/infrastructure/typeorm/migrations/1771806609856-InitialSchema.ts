import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1771806609856 implements MigrationInterface {
  name = 'InitialSchema1771806609856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`stadiums\` (\`id\` varchar(191) NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ceac6207277b20dcc9048a4751\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`games\` (\`id\` varchar(191) NOT NULL, \`game_date\` datetime(3) NOT NULL, \`opponent\` varchar(255) NOT NULL, \`dragons_score\` int NOT NULL, \`opponent_score\` int NOT NULL, \`result\` enum ('win', 'lose', 'draw') NOT NULL, \`stadium_id\` varchar(191) NOT NULL, \`notes\` varchar(191) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_registration_requests\` (\`id\` varchar(191) NOT NULL, \`user_id\` varchar(191) NOT NULL, \`status\` enum ('pending', 'approved', 'rejected', 'banned') NOT NULL DEFAULT 'pending', \`reasonForRejection\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(191) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`games\` ADD CONSTRAINT \`FK_d7f60119c29d181fda573c3a460\` FOREIGN KEY (\`stadium_id\`) REFERENCES \`stadiums\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_registration_requests\` ADD CONSTRAINT \`FK_9ec072b11958125c65afa5445ce\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_registration_requests\` DROP FOREIGN KEY \`FK_9ec072b11958125c65afa5445ce\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`games\` DROP FOREIGN KEY \`FK_d7f60119c29d181fda573c3a460\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`user_registration_requests\``);
    await queryRunner.query(`DROP TABLE \`games\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ceac6207277b20dcc9048a4751\` ON \`stadiums\``,
    );
    await queryRunner.query(`DROP TABLE \`stadiums\``);
  }
}

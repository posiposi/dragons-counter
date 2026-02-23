import { getMetadataArgsStorage } from 'typeorm';
import { UsersGamesEntity } from './user-game.entity';
import { UserEntity } from './user.entity';
import { GameEntity } from './game.entity';

function findColumn(propertyName: string) {
  return getMetadataArgsStorage()
    .columns.filter((c) => c.target === UsersGamesEntity)
    .find((c) => c.propertyName === propertyName);
}

describe('UsersGamesEntity', () => {
  describe('テーブル定義', () => {
    it('users_gamesテーブルにマッピングされる', () => {
      const tableMetadata = getMetadataArgsStorage().tables.find(
        (table) => table.target === UsersGamesEntity,
      );

      expect(tableMetadata).toBeDefined();
      expect(tableMetadata!.name).toBe('users_games');
    });

    it('ユニーク制約が設定される', () => {
      const uniques = getMetadataArgsStorage().uniques.filter(
        (u) => u.target === UsersGamesEntity,
      );
      const userGameUnique = uniques.find(
        (u) => u.name === 'UQ_users_games_user_game',
      );

      expect(userGameUnique).toBeDefined();
      expect(userGameUnique!.columns).toEqual(['userId', 'gameId']);
    });
  });

  describe('カラム定義', () => {
    it('idカラムがvarchar(191)型の主キーとして定義される', () => {
      const idColumn = findColumn('id');

      expect(idColumn).toBeDefined();
      expect(idColumn!.options.type).toBe('varchar');
      expect(idColumn!.options.length).toBe(191);
      expect(idColumn!.options.primary).toBe(true);
      expect(idColumn!.mode).toBe('regular');
    });

    it('idカラムに自動生成が設定されていない', () => {
      const generatedColumns = getMetadataArgsStorage().generations.filter(
        (gen) => gen.target === UsersGamesEntity,
      );

      expect(generatedColumns).toHaveLength(0);
    });

    it('userIdカラムがuser_idにマッピングされvarchar(191)型である', () => {
      const userIdColumn = findColumn('userId');

      expect(userIdColumn).toBeDefined();
      expect(userIdColumn!.options.name).toBe('user_id');
      expect(userIdColumn!.options.type).toBe('varchar');
      expect(userIdColumn!.options.length).toBe(191);
    });

    it('gameIdカラムがgame_idにマッピングされvarchar(191)型である', () => {
      const gameIdColumn = findColumn('gameId');

      expect(gameIdColumn).toBeDefined();
      expect(gameIdColumn!.options.name).toBe('game_id');
      expect(gameIdColumn!.options.type).toBe('varchar');
      expect(gameIdColumn!.options.length).toBe(191);
    });

    it('impressionカラムがvarchar(191)型でnullableとして定義される', () => {
      const impressionColumn = findColumn('impression');

      expect(impressionColumn).toBeDefined();
      expect(impressionColumn!.options.type).toBe('varchar');
      expect(impressionColumn!.options.length).toBe(191);
      expect(impressionColumn!.options.nullable).toBe(true);
    });

    it('createdAtカラムがcreated_atにマッピングされる', () => {
      const createdAtColumn = findColumn('createdAt');

      expect(createdAtColumn).toBeDefined();
      expect(createdAtColumn!.options.name).toBe('created_at');
      expect(createdAtColumn!.mode).toBe('createDate');
    });

    it('updatedAtカラムがupdated_atにマッピングされる', () => {
      const updatedAtColumn = findColumn('updatedAt');

      expect(updatedAtColumn).toBeDefined();
      expect(updatedAtColumn!.options.name).toBe('updated_at');
      expect(updatedAtColumn!.mode).toBe('updateDate');
    });

    it('deletedAtカラムがdeleted_atにマッピングされソフトデリート用に定義される', () => {
      const deletedAtColumn = findColumn('deletedAt');

      expect(deletedAtColumn).toBeDefined();
      expect(deletedAtColumn!.options.name).toBe('deleted_at');
      expect(deletedAtColumn!.mode).toBe('deleteDate');
    });
  });

  describe('リレーション定義', () => {
    it('userプロパティにManyToOneリレーションが定義される', () => {
      const relations = getMetadataArgsStorage().relations.filter(
        (relation) => relation.target === UsersGamesEntity,
      );
      const userRelation = relations.find(
        (relation) => relation.propertyName === 'user',
      );

      expect(userRelation).toBeDefined();
      expect(userRelation!.relationType).toBe('many-to-one');
    });

    it('userプロパティにJoinColumnが設定される', () => {
      const joinColumns = getMetadataArgsStorage().joinColumns.filter(
        (jc) => jc.target === UsersGamesEntity,
      );
      const userJoinColumn = joinColumns.find(
        (jc) => jc.propertyName === 'user',
      );

      expect(userJoinColumn).toBeDefined();
      expect(userJoinColumn!.name).toBe('user_id');
    });

    it('gameプロパティにManyToOneリレーションが定義される', () => {
      const relations = getMetadataArgsStorage().relations.filter(
        (relation) => relation.target === UsersGamesEntity,
      );
      const gameRelation = relations.find(
        (relation) => relation.propertyName === 'game',
      );

      expect(gameRelation).toBeDefined();
      expect(gameRelation!.relationType).toBe('many-to-one');
    });

    it('gameプロパティにJoinColumnが設定される', () => {
      const joinColumns = getMetadataArgsStorage().joinColumns.filter(
        (jc) => jc.target === UsersGamesEntity,
      );
      const gameJoinColumn = joinColumns.find(
        (jc) => jc.propertyName === 'game',
      );

      expect(gameJoinColumn).toBeDefined();
      expect(gameJoinColumn!.name).toBe('game_id');
    });

    it('UserEntityへのリレーションがUserEntityを参照する', () => {
      const relations = getMetadataArgsStorage().relations.filter(
        (relation) => relation.target === UsersGamesEntity,
      );
      const userRelation = relations.find(
        (relation) => relation.propertyName === 'user',
      );

      expect(userRelation).toBeDefined();
      const relationType = (userRelation!.type as () => unknown)();
      expect(relationType).toBe(UserEntity);
    });

    it('GameEntityへのリレーションがGameEntityを参照する', () => {
      const relations = getMetadataArgsStorage().relations.filter(
        (relation) => relation.target === UsersGamesEntity,
      );
      const gameRelation = relations.find(
        (relation) => relation.propertyName === 'game',
      );

      expect(gameRelation).toBeDefined();
      const relationType = (gameRelation!.type as () => unknown)();
      expect(relationType).toBe(GameEntity);
    });
  });

  describe('インスタンス生成', () => {
    it('プロパティに値を設定できる', () => {
      const entity = new UsersGamesEntity();
      entity.id = '550e8400-e29b-41d4-a716-446655440000';
      entity.userId = '660e8400-e29b-41d4-a716-446655440001';
      entity.gameId = '770e8400-e29b-41d4-a716-446655440002';
      entity.impression = '素晴らしい試合だった';
      entity.createdAt = new Date('2026-04-01');
      entity.updatedAt = new Date('2026-04-01');
      entity.deletedAt = null;

      expect(entity.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(entity.userId).toBe('660e8400-e29b-41d4-a716-446655440001');
      expect(entity.gameId).toBe('770e8400-e29b-41d4-a716-446655440002');
      expect(entity.impression).toBe('素晴らしい試合だった');
      expect(entity.deletedAt).toBeNull();
    });

    it('impressionにnullを設定できる', () => {
      const entity = new UsersGamesEntity();
      entity.impression = null;

      expect(entity.impression).toBeNull();
    });
  });
});

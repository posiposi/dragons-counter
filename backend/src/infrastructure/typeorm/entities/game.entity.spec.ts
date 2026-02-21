import { getMetadataArgsStorage } from 'typeorm';
import { GameEntity } from './game.entity';
import { GameResultEnum } from '../enums/game-result.enum';
import { StadiumEntity } from './stadium.entity';

function findColumn(propertyName: string) {
  return getMetadataArgsStorage()
    .columns.filter((c) => c.target === GameEntity)
    .find((c) => c.propertyName === propertyName);
}

describe('GameEntity', () => {
  describe('テーブル定義', () => {
    it('gamesテーブルにマッピングされる', () => {
      const tableMetadata = getMetadataArgsStorage().tables.find(
        (table) => table.target === GameEntity,
      );

      expect(tableMetadata).toBeDefined();
      expect(tableMetadata!.name).toBe('games');
    });
  });

  describe('カラム定義', () => {
    it('idカラムがvarchar(191)型の主キーとして定義される', () => {
      const idColumn = findColumn('id');

      expect(idColumn).toBeDefined();
      expect(idColumn!.options.type).toBe('varchar');
      expect(idColumn!.options.length).toBe(191);
      expect(idColumn!.mode).toBe('regular');
    });

    it('idカラムに自動生成が設定されていない', () => {
      const generatedColumns = getMetadataArgsStorage().generations.filter(
        (gen) => gen.target === GameEntity,
      );

      expect(generatedColumns).toHaveLength(0);
    });

    it('gameDateカラムがgame_dateにマッピングされる', () => {
      const gameDateColumn = findColumn('gameDate');

      expect(gameDateColumn).toBeDefined();
      expect(gameDateColumn!.options.name).toBe('game_date');
      expect(gameDateColumn!.options.type).toBe('datetime');
    });

    it('opponentカラムがvarchar型で定義される', () => {
      const opponentColumn = findColumn('opponent');

      expect(opponentColumn).toBeDefined();
      expect(opponentColumn!.options.type).toBe('varchar');
    });

    it('dragonsScoreカラムがdragons_scoreにマッピングされる', () => {
      const dragonsScoreColumn = findColumn('dragonsScore');

      expect(dragonsScoreColumn).toBeDefined();
      expect(dragonsScoreColumn!.options.name).toBe('dragons_score');
      expect(dragonsScoreColumn!.options.type).toBe('int');
    });

    it('opponentScoreカラムがopponent_scoreにマッピングされる', () => {
      const opponentScoreColumn = findColumn('opponentScore');

      expect(opponentScoreColumn).toBeDefined();
      expect(opponentScoreColumn!.options.name).toBe('opponent_score');
      expect(opponentScoreColumn!.options.type).toBe('int');
    });

    it('resultカラムがenum型でGameResultEnumを使用する', () => {
      const resultColumn = findColumn('result');

      expect(resultColumn).toBeDefined();
      expect(resultColumn!.options.type).toBe('enum');
      expect(resultColumn!.options.enum).toBe(GameResultEnum);
    });

    it('stadiumIdカラムがstadium_idにマッピングされる', () => {
      const stadiumIdColumn = findColumn('stadiumId');

      expect(stadiumIdColumn).toBeDefined();
      expect(stadiumIdColumn!.options.name).toBe('stadium_id');
      expect(stadiumIdColumn!.options.type).toBe('uuid');
    });

    it('notesカラムがtext型でnullableとして定義される', () => {
      const notesColumn = findColumn('notes');

      expect(notesColumn).toBeDefined();
      expect(notesColumn!.options.type).toBe('text');
      expect(notesColumn!.options.nullable).toBe(true);
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
    it('stadiumプロパティにManyToOneリレーションが定義される', () => {
      const relations = getMetadataArgsStorage().relations.filter(
        (relation) => relation.target === GameEntity,
      );
      const stadiumRelation = relations.find(
        (relation) => relation.propertyName === 'stadium',
      );

      expect(stadiumRelation).toBeDefined();
      expect(stadiumRelation!.relationType).toBe('many-to-one');
    });

    it('stadiumプロパティにJoinColumnが設定される', () => {
      const joinColumns = getMetadataArgsStorage().joinColumns.filter(
        (jc) => jc.target === GameEntity,
      );
      const stadiumJoinColumn = joinColumns.find(
        (jc) => jc.propertyName === 'stadium',
      );

      expect(stadiumJoinColumn).toBeDefined();
      expect(stadiumJoinColumn!.name).toBe('stadium_id');
    });

    it('StadiumEntityにOneToManyリレーションが定義される', () => {
      const relations = getMetadataArgsStorage().relations.filter(
        (relation) => relation.target === StadiumEntity,
      );
      const gamesRelation = relations.find(
        (relation) => relation.propertyName === 'games',
      );

      expect(gamesRelation).toBeDefined();
      expect(gamesRelation!.relationType).toBe('one-to-many');
    });
  });

  describe('インスタンス生成', () => {
    it('プロパティに値を設定できる', () => {
      const entity = new GameEntity();
      entity.id = '550e8400-e29b-41d4-a716-446655440000';
      entity.gameDate = new Date('2026-04-01');
      entity.opponent = '阪神タイガース';
      entity.dragonsScore = 5;
      entity.opponentScore = 3;
      entity.result = GameResultEnum.WIN;
      entity.stadiumId = '660e8400-e29b-41d4-a716-446655440001';
      entity.notes = '逆転勝利';
      entity.createdAt = new Date('2026-04-01');
      entity.updatedAt = new Date('2026-04-01');
      entity.deletedAt = null;

      expect(entity.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(entity.gameDate).toEqual(new Date('2026-04-01'));
      expect(entity.opponent).toBe('阪神タイガース');
      expect(entity.dragonsScore).toBe(5);
      expect(entity.opponentScore).toBe(3);
      expect(entity.result).toBe(GameResultEnum.WIN);
      expect(entity.stadiumId).toBe('660e8400-e29b-41d4-a716-446655440001');
      expect(entity.notes).toBe('逆転勝利');
      expect(entity.deletedAt).toBeNull();
    });

    it('notesにnullを設定できる', () => {
      const entity = new GameEntity();
      entity.notes = null;

      expect(entity.notes).toBeNull();
    });
  });
});

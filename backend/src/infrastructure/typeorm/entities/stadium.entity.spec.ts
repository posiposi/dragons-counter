import { getMetadataArgsStorage } from 'typeorm';
import { StadiumEntity } from './stadium.entity';

function getColumns() {
  return getMetadataArgsStorage().columns.filter(
    (column) => column.target === StadiumEntity,
  );
}

function findColumn(propertyName: string) {
  return getColumns().find((column) => column.propertyName === propertyName);
}

describe('StadiumEntity', () => {
  describe('テーブル定義', () => {
    it('stadiumsテーブルにマッピングされる', () => {
      const tableMetadata = getMetadataArgsStorage().tables.find(
        (table) => table.target === StadiumEntity,
      );

      expect(tableMetadata).toBeDefined();
      expect(tableMetadata!.name).toBe('stadiums');
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
        (gen) => gen.target === StadiumEntity,
      );

      expect(generatedColumns).toHaveLength(0);
    });

    it('nameカラムがunique制約付きで定義される', () => {
      const nameColumn = findColumn('name');

      expect(nameColumn).toBeDefined();
      expect(nameColumn!.options.unique).toBe(true);
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
  });

  describe('インスタンス生成', () => {
    it('プロパティに値を設定できる', () => {
      const entity = new StadiumEntity();
      entity.id = 'test-uuid';
      entity.name = 'バンテリンドーム';

      expect(entity.id).toBe('test-uuid');
      expect(entity.name).toBe('バンテリンドーム');
    });
  });
});

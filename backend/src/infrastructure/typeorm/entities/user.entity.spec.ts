import { getMetadataArgsStorage } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserRoleEnum } from '../enums/user-role.enum';

function findColumn(propertyName: string) {
  return getMetadataArgsStorage()
    .columns.filter((c) => c.target === UserEntity)
    .find((c) => c.propertyName === propertyName);
}

describe('UserEntity', () => {
  describe('テーブル定義', () => {
    it('usersテーブルにマッピングされる', () => {
      const userTable = getMetadataArgsStorage().tables.find(
        (t) => t.target === UserEntity,
      );
      expect(userTable).toBeDefined();
      expect(userTable!.name).toBe('users');
    });
  });

  describe('カラム定義', () => {
    it('idカラムがUUID型の主キーとして定義される', () => {
      const idColumn = findColumn('id');
      expect(idColumn).toBeDefined();
      expect(idColumn!.options.type).toBe('uuid');
      expect(idColumn!.mode).toBe('regular');
    });

    it('emailカラムがunique制約付きで定義される', () => {
      const emailColumn = findColumn('email');
      expect(emailColumn).toBeDefined();
      expect(emailColumn!.options.unique).toBe(true);
    });

    it('passwordカラムがvarchar型で定義される', () => {
      const passwordColumn = findColumn('password');
      expect(passwordColumn).toBeDefined();
      expect(passwordColumn!.options.type).toBe('varchar');
    });

    it('roleカラムがenum型でUserRoleEnumを使用し、デフォルト値がUSERである', () => {
      const roleColumn = findColumn('role');
      expect(roleColumn).toBeDefined();
      expect(roleColumn!.options.type).toBe('enum');
      expect(roleColumn!.options.enum).toBe(UserRoleEnum);
      expect(roleColumn!.options.default).toBe(UserRoleEnum.USER);
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
      const entity = new UserEntity();
      entity.id = '550e8400-e29b-41d4-a716-446655440000';
      entity.email = 'test@example.com';
      entity.password = 'hashed_password';
      entity.role = UserRoleEnum.ADMIN;
      entity.createdAt = new Date('2026-01-01');
      entity.updatedAt = new Date('2026-01-02');

      expect(entity.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(entity.email).toBe('test@example.com');
      expect(entity.password).toBe('hashed_password');
      expect(entity.role).toBe(UserRoleEnum.ADMIN);
      expect(entity.createdAt).toEqual(new Date('2026-01-01'));
      expect(entity.updatedAt).toEqual(new Date('2026-01-02'));
    });
  });
});

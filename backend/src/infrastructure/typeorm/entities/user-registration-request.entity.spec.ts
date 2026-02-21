import { getMetadataArgsStorage } from 'typeorm';
import { UserRegistrationRequestEntity } from './user-registration-request.entity';
import { UserEntity } from './user.entity';
import { RegistrationStatusEnum } from '../enums/registration-status.enum';

function findColumn(propertyName: string) {
  return getMetadataArgsStorage()
    .columns.filter((c) => c.target === UserRegistrationRequestEntity)
    .find((c) => c.propertyName === propertyName);
}

describe('UserRegistrationRequestEntity', () => {
  describe('テーブル定義', () => {
    it('user_registration_requestsテーブルにマッピングされる', () => {
      const table = getMetadataArgsStorage().tables.find(
        (t) => t.target === UserRegistrationRequestEntity,
      );
      expect(table).toBeDefined();
      expect(table!.name).toBe('user_registration_requests');
    });
  });

  describe('カラム定義', () => {
    it('idカラムがUUID型の主キーとして定義される', () => {
      const idColumn = findColumn('id');
      expect(idColumn).toBeDefined();
      expect(idColumn!.options.type).toBe('uuid');
      expect(idColumn!.mode).toBe('regular');
    });

    it('userIdカラムがuser_idにマッピングされる', () => {
      const userIdColumn = findColumn('userId');
      expect(userIdColumn).toBeDefined();
      expect(userIdColumn!.options.name).toBe('user_id');
    });

    it('statusカラムがenum型でRegistrationStatusEnumを使用し、デフォルト値がPENDINGである', () => {
      const statusColumn = findColumn('status');
      expect(statusColumn).toBeDefined();
      expect(statusColumn!.options.type).toBe('enum');
      expect(statusColumn!.options.enum).toBe(RegistrationStatusEnum);
      expect(statusColumn!.options.default).toBe(
        RegistrationStatusEnum.PENDING,
      );
    });

    it('reasonForRejectionカラムがreason_for_rejectionにマッピングされnullableである', () => {
      const reasonColumn = findColumn('reasonForRejection');
      expect(reasonColumn).toBeDefined();
      expect(reasonColumn!.options.name).toBe('reason_for_rejection');
      expect(reasonColumn!.options.type).toBe('varchar');
      expect(reasonColumn!.options.nullable).toBe(true);
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

  describe('リレーション定義', () => {
    it('UserEntityへのManyToOneリレーションが定義される', () => {
      const relations = getMetadataArgsStorage().relations.filter(
        (r) => r.target === UserRegistrationRequestEntity,
      );
      const userRelation = relations.find((r) => r.propertyName === 'user');
      expect(userRelation).toBeDefined();
      expect(userRelation!.relationType).toBe('many-to-one');
    });

    it('user_idカラムでJoinColumnが定義される', () => {
      const joinColumns = getMetadataArgsStorage().joinColumns.filter(
        (jc) => jc.target === UserRegistrationRequestEntity,
      );
      const userJoinColumn = joinColumns.find(
        (jc) => jc.propertyName === 'user',
      );
      expect(userJoinColumn).toBeDefined();
      expect(userJoinColumn!.name).toBe('user_id');
    });

    it('UserEntityにOneToManyリレーションが定義される', () => {
      const relations = getMetadataArgsStorage().relations.filter(
        (r) => r.target === UserEntity,
      );
      const registrationRequestsRelation = relations.find(
        (r) => r.propertyName === 'registrationRequests',
      );
      expect(registrationRequestsRelation).toBeDefined();
      expect(registrationRequestsRelation!.relationType).toBe('one-to-many');
    });
  });

  describe('インスタンス生成', () => {
    it('プロパティに値を設定できる', () => {
      const entity = new UserRegistrationRequestEntity();
      entity.id = '550e8400-e29b-41d4-a716-446655440000';
      entity.userId = '660e8400-e29b-41d4-a716-446655440001';
      entity.status = RegistrationStatusEnum.PENDING;
      entity.reasonForRejection = null;
      entity.createdAt = new Date('2026-01-01');
      entity.updatedAt = new Date('2026-01-02');

      expect(entity.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(entity.userId).toBe('660e8400-e29b-41d4-a716-446655440001');
      expect(entity.status).toBe(RegistrationStatusEnum.PENDING);
      expect(entity.reasonForRejection).toBeNull();
      expect(entity.createdAt).toEqual(new Date('2026-01-01'));
      expect(entity.updatedAt).toEqual(new Date('2026-01-02'));
    });

    it('reasonForRejectionに文字列を設定できる', () => {
      const entity = new UserRegistrationRequestEntity();
      entity.reasonForRejection = '不正なアカウントのため';

      expect(entity.reasonForRejection).toBe('不正なアカウントのため');
    });
  });
});

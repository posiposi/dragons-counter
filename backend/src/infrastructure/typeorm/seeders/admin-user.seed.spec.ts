import { DataSource, EntityManager, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRegistrationRequestEntity } from '../entities/user-registration-request.entity';
import { UserRoleEnum } from '../enums/user-role.enum';
import { RegistrationStatusEnum } from '../enums/registration-status.enum';
import { seedAdminUser } from './admin-user.seed';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('seedAdminUser', () => {
  let mockDataSource: Partial<DataSource>;
  let mockUserRepository: Partial<Repository<UserEntity>>;
  let mockManager: Partial<EntityManager>;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.ADMIN_DEFAULT_PASSWORD = 'password123';

    mockUserRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    mockManager = {
      create: jest
        .fn()
        .mockImplementation(
          (_entity: unknown, data: Record<string, unknown>) => data,
        ),
      save: jest.fn().mockResolvedValue(undefined),
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockUserRepository),
      transaction: jest
        .fn()
        .mockImplementation(
          (cb: (manager: Partial<EntityManager>) => Promise<void>) =>
            cb(mockManager),
        ),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('ADMIN_EMAILが未設定の場合はスキップすること', async () => {
    delete process.env.ADMIN_EMAIL;

    await seedAdminUser(mockDataSource as DataSource);

    expect(mockDataSource.getRepository).not.toHaveBeenCalled();
  });

  it('ADMIN_DEFAULT_PASSWORDが未設定の場合はスキップすること', async () => {
    delete process.env.ADMIN_DEFAULT_PASSWORD;

    await seedAdminUser(mockDataSource as DataSource);

    expect(mockDataSource.getRepository).not.toHaveBeenCalled();
  });

  it('管理者ユーザーが既に存在する場合はスキップすること', async () => {
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'existing-id',
      email: 'admin@example.com',
    });

    await seedAdminUser(mockDataSource as DataSource);

    expect(mockDataSource.transaction).not.toHaveBeenCalled();
  });

  it('ADMINロールで管理者ユーザーを作成すること', async () => {
    await seedAdminUser(mockDataSource as DataSource);

    expect(mockManager.create).toHaveBeenCalledWith(
      UserEntity,
      expect.objectContaining({
        email: 'admin@example.com',
        password: 'hashed_password',
        role: UserRoleEnum.ADMIN,
      }),
    );
  });

  it('APPROVEDステータスで登録申請を作成すること', async () => {
    await seedAdminUser(mockDataSource as DataSource);

    expect(mockManager.create).toHaveBeenCalledWith(
      UserRegistrationRequestEntity,
      expect.objectContaining({
        status: RegistrationStatusEnum.APPROVED,
      }),
    );
  });

  it('トランザクション内でユーザーと登録申請を保存すること', async () => {
    await seedAdminUser(mockDataSource as DataSource);

    expect(mockDataSource.transaction).toHaveBeenCalled();
    expect(mockManager.save).toHaveBeenCalledTimes(2);
  });
});

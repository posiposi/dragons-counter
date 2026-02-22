import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Repository,
  QueryFailedError,
  DataSource,
  EntityManager,
} from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserCommandAdapter } from './user-command.adapter';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { RegistrationStatus } from '../../domain/enums/registration-status';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { UserEntity } from '../typeorm/entities/user.entity';
import { UserRegistrationRequestEntity } from '../typeorm/entities/user-registration-request.entity';
import { UserRoleEnum } from '../typeorm/enums/user-role.enum';
import { RegistrationStatusEnum } from '../typeorm/enums/registration-status.enum';
import { createDataSourceOptions } from '../typeorm/data-source';

describe('UserCommandAdapter ユニットテスト', () => {
  let adapter: UserCommandAdapter;
  let mockUserRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };
  let mockRegistrationRequestRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockDataSource: {
    transaction: jest.Mock;
  };

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    mockRegistrationRequestRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    mockDataSource = {
      transaction: jest.fn(),
    };
    adapter = new UserCommandAdapter(
      mockUserRepository as unknown as Repository<UserEntity>,
      mockRegistrationRequestRepository as unknown as Repository<UserRegistrationRequestEntity>,
      mockDataSource as unknown as DataSource,
    );
  });

  describe('save', () => {
    it('ER_DUP_ENTRYエラー時にUserAlreadyExistsExceptionをスローする', async () => {
      const email = Email.create('duplicate@example.com');
      const password = await Password.fromPlainText('password123');
      const user = User.createNew(email, password);

      const queryFailedError = new QueryFailedError(
        'INSERT INTO users',
        [],
        new Error('ER_DUP_ENTRY'),
      );
      (
        queryFailedError as unknown as { driverError: { code: string } }
      ).driverError = {
        code: 'ER_DUP_ENTRY',
      };

      mockUserRepository.create.mockReturnValue({});
      mockRegistrationRequestRepository.create.mockReturnValue({});
      mockDataSource.transaction.mockImplementation(
        async (cb: (manager: EntityManager) => Promise<void>) => {
          const mockManager = {
            save: jest.fn().mockRejectedValue(queryFailedError),
          };
          await cb(mockManager as unknown as EntityManager);
        },
      );

      await expect(adapter.save(user)).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });

    it('ER_DUP_ENTRY以外のQueryFailedErrorはそのまま再スローする', async () => {
      const email = Email.create('error@example.com');
      const password = await Password.fromPlainText('password123');
      const user = User.createNew(email, password);

      const originalError = new QueryFailedError(
        'INSERT INTO users',
        [],
        new Error('OTHER_ERROR'),
      );
      (
        originalError as unknown as { driverError: { code: string } }
      ).driverError = {
        code: 'OTHER_ERROR',
      };

      mockUserRepository.create.mockReturnValue({});
      mockRegistrationRequestRepository.create.mockReturnValue({});
      mockDataSource.transaction.mockImplementation(
        async (cb: (manager: EntityManager) => Promise<void>) => {
          const mockManager = {
            save: jest.fn().mockRejectedValue(originalError),
          };
          await cb(mockManager as unknown as EntityManager);
        },
      );

      await expect(adapter.save(user)).rejects.toThrow(originalError);
    });

    it('予期しないエラーはそのまま再スローする', async () => {
      const email = Email.create('unexpected@example.com');
      const password = await Password.fromPlainText('password123');
      const user = User.createNew(email, password);

      const originalError = new Error('Connection lost');

      mockUserRepository.create.mockReturnValue({});
      mockRegistrationRequestRepository.create.mockReturnValue({});
      mockDataSource.transaction.mockImplementation(
        async (cb: (manager: EntityManager) => Promise<void>) => {
          const mockManager = {
            save: jest.fn().mockRejectedValue(originalError),
          };
          await cb(mockManager as unknown as EntityManager);
        },
      );

      await expect(adapter.save(user)).rejects.toThrow(originalError);
    });
  });
});

describe('UserCommandAdapter 統合テスト', () => {
  let module: TestingModule;
  let userRepository: Repository<UserEntity>;
  let registrationRequestRepository: Repository<UserRegistrationRequestEntity>;
  let adapter: UserCommandAdapter;

  const testEmailPrefix = 'user-cmd-adapter-';

  beforeAll(async () => {
    const dataSourceOptions = createDataSourceOptions(
      process.env.DATABASE_URL ?? '',
    );

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dataSourceOptions),
        TypeOrmModule.forFeature([UserEntity, UserRegistrationRequestEntity]),
      ],
      providers: [UserCommandAdapter],
    }).compile();

    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    registrationRequestRepository = module.get<
      Repository<UserRegistrationRequestEntity>
    >(getRepositoryToken(UserRegistrationRequestEntity));
    adapter = module.get<UserCommandAdapter>(UserCommandAdapter);
  });

  afterEach(async () => {
    await registrationRequestRepository
      .createQueryBuilder()
      .delete()
      .where('userId IN (SELECT id FROM users WHERE email LIKE :pattern)', {
        pattern: `${testEmailPrefix}%`,
      })
      .execute();
    await userRepository
      .createQueryBuilder()
      .delete()
      .where('email LIKE :pattern', { pattern: `${testEmailPrefix}%` })
      .execute();
  });

  afterAll(async () => {
    await registrationRequestRepository
      .createQueryBuilder()
      .delete()
      .where('userId IN (SELECT id FROM users WHERE email LIKE :pattern)', {
        pattern: `${testEmailPrefix}%`,
      })
      .execute();
    await userRepository
      .createQueryBuilder()
      .delete()
      .where('email LIKE :pattern', { pattern: `${testEmailPrefix}%` })
      .execute();
    await module.close();
  });

  describe('save', () => {
    it('新規ユーザー保存時にPENDINGステータスの登録リクエストが作成される', async () => {
      const email = Email.create(`${testEmailPrefix}save@example.com`);
      const password = await Password.fromPlainText('password123');
      const user = User.createNew(email, password);

      const result = await adapter.save(user);

      expect(result).toBeInstanceOf(User);
      expect(result.id.value).toBe(user.id.value);
      expect(result.email.value).toBe(`${testEmailPrefix}save@example.com`);
      expect(result.registrationStatus).toBe(RegistrationStatus.PENDING);

      const savedUser = await userRepository.findOne({
        where: { id: user.id.value },
        relations: ['registrationRequests'],
      });
      expect(savedUser).not.toBeNull();
      expect(savedUser?.email).toBe(`${testEmailPrefix}save@example.com`);
      expect(savedUser?.registrationRequests).toHaveLength(1);
      expect(savedUser?.registrationRequests[0].status).toBe(
        RegistrationStatusEnum.PENDING,
      );
    });

    it('パスワードがハッシュ化された状態で保存される', async () => {
      const email = Email.create(`${testEmailPrefix}hash@example.com`);
      const password = await Password.fromPlainText('password123');
      const user = User.createNew(email, password);

      await adapter.save(user);

      const savedUser = await userRepository.findOne({
        where: { id: user.id.value },
      });
      expect(savedUser?.password).not.toBe('password123');
      expect(savedUser?.password).toBe(password.hash);
    });

    it('ユーザーロールが正しくマッピングされる', async () => {
      const email = Email.create(`${testEmailPrefix}role@example.com`);
      const password = await Password.fromPlainText('password123');
      const user = User.createNew(email, password);

      await adapter.save(user);

      const savedUser = await userRepository.findOne({
        where: { id: user.id.value },
      });
      expect(savedUser?.role).toBe(UserRoleEnum.USER);
    });
  });

  describe('updateRegistrationStatus', () => {
    it('更新されたステータスで新しい登録リクエストが保存される', async () => {
      const email = Email.create(`${testEmailPrefix}status@example.com`);
      const password = await Password.fromPlainText('password123');
      const user = User.createNew(email, password);

      const savedUser = await adapter.save(user);
      const approvedUser = savedUser.approve();

      const result = await adapter.updateRegistrationStatus(approvedUser);

      expect(result).toBeInstanceOf(User);
      expect(result.registrationStatus).toBe(RegistrationStatus.APPROVED);

      const requests = await registrationRequestRepository.find({
        where: { userId: user.id.value },
        order: { createdAt: 'DESC' },
      });
      expect(requests).toHaveLength(2);
      expect(requests[0].status).toBe(RegistrationStatusEnum.APPROVED);
      expect(requests[1].status).toBe(RegistrationStatusEnum.PENDING);
    });
  });
});

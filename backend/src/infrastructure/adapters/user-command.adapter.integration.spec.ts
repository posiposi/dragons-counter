import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Repository,
  QueryFailedError,
  DataSource,
  EntityManager,
  Like,
  In,
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
  let registrationRequestRepository: Repository<UserRegistrationRequestEntity>;
  let adapter: UserCommandAdapter;
  let dataSource: DataSource;

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

    registrationRequestRepository = module.get<
      Repository<UserRegistrationRequestEntity>
    >(getRepositoryToken(UserRegistrationRequestEntity));
    adapter = module.get<UserCommandAdapter>(UserCommandAdapter);
    dataSource = module.get<DataSource>(DataSource);
  });

  const cleanupTestData = async () => {
    await dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const rrRepo = manager.getRepository(UserRegistrationRequestEntity);

      const testUsers = await userRepo.find({
        where: { email: Like(`${testEmailPrefix}%`) },
        select: ['id'],
      });
      const userIds = testUsers.map((u) => u.id);

      if (userIds.length > 0) {
        await rrRepo.delete({ userId: In(userIds) });
      }
      await userRepo.delete({ email: Like(`${testEmailPrefix}%`) });
    });
  };

  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await module.close();
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
      });
      expect(requests).toHaveLength(2);
      const statuses = requests.map((r) => r.status);
      expect(statuses).toContain(RegistrationStatusEnum.APPROVED);
      expect(statuses).toContain(RegistrationStatusEnum.PENDING);
    });
  });
});

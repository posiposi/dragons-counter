import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository, DataSource, Like, In } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { UserQueryAdapter } from './user-query.adapter';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';
import { UserId } from '../../domain/value-objects/user-id';
import { RegistrationStatus } from '../../domain/enums/registration-status';
import { UserEntity } from '../typeorm/entities/user.entity';
import { UserRegistrationRequestEntity } from '../typeorm/entities/user-registration-request.entity';
import { UserRoleEnum } from '../typeorm/enums/user-role.enum';
import { RegistrationStatusEnum } from '../typeorm/enums/registration-status.enum';
import { createDataSourceOptions } from '../typeorm/data-source';

describe('UserQueryAdapter 統合テスト', () => {
  let module: TestingModule;
  let userRepository: Repository<UserEntity>;
  let registrationRequestRepository: Repository<UserRegistrationRequestEntity>;
  let adapter: UserQueryAdapter;
  let dataSource: DataSource;

  const testEmailPrefix = 'user-query-adapter-';

  beforeAll(async () => {
    const dataSourceOptions = createDataSourceOptions(
      process.env.DATABASE_URL ?? '',
    );

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dataSourceOptions),
        TypeOrmModule.forFeature([UserEntity, UserRegistrationRequestEntity]),
      ],
      providers: [UserQueryAdapter],
    }).compile();

    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    registrationRequestRepository = module.get<
      Repository<UserRegistrationRequestEntity>
    >(getRepositoryToken(UserRegistrationRequestEntity));
    adapter = module.get<UserQueryAdapter>(UserQueryAdapter);
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

  describe('findByEmail', () => {
    it('メールアドレスが存在する場合にUserを返す', async () => {
      const testUserId = randomUUID();
      const testEmail = `${testEmailPrefix}find-email@example.com`;
      const testPasswordHash =
        '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12';

      const userEntity = userRepository.create({
        id: testUserId,
        email: testEmail,
        password: testPasswordHash,
        role: UserRoleEnum.USER,
      });
      await userRepository.save(userEntity);

      const requestEntity = registrationRequestRepository.create({
        id: randomUUID(),
        userId: testUserId,
        status: RegistrationStatusEnum.APPROVED,
      });
      await registrationRequestRepository.save(requestEntity);

      const email = Email.create(testEmail);
      const result = await adapter.findByEmail(email);

      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(User);
      expect(result?.email.value).toBe(testEmail);
      expect(result?.id.value).toBe(testUserId);
      expect(result?.registrationStatus).toBe(RegistrationStatus.APPROVED);
    });

    it('メールアドレスが存在しない場合にnullを返す', async () => {
      const email = Email.create(`${testEmailPrefix}nonexistent@example.com`);
      const result = await adapter.findByEmail(email);

      expect(result).toBeNull();
    });

    it('複数の登録リクエストがある場合に最新のステータスを返す', async () => {
      const testUserId = randomUUID();
      const testEmail = `${testEmailPrefix}latest-status@example.com`;
      const testPasswordHash =
        '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12';

      const userEntity = userRepository.create({
        id: testUserId,
        email: testEmail,
        password: testPasswordHash,
        role: UserRoleEnum.USER,
      });
      await userRepository.save(userEntity);

      const olderRequest = registrationRequestRepository.create({
        id: randomUUID(),
        userId: testUserId,
        status: RegistrationStatusEnum.APPROVED,
      });
      await registrationRequestRepository.save(olderRequest);
      await registrationRequestRepository
        .createQueryBuilder()
        .update(UserRegistrationRequestEntity)
        .set({ createdAt: new Date('2025-01-01T00:00:00Z') })
        .where('id = :id', { id: olderRequest.id })
        .execute();

      const newerRequest = registrationRequestRepository.create({
        id: randomUUID(),
        userId: testUserId,
        status: RegistrationStatusEnum.REJECTED,
      });
      await registrationRequestRepository.save(newerRequest);
      await registrationRequestRepository
        .createQueryBuilder()
        .update(UserRegistrationRequestEntity)
        .set({ createdAt: new Date('2025-06-01T00:00:00Z') })
        .where('id = :id', { id: newerRequest.id })
        .execute();

      const email = Email.create(testEmail);
      const result = await adapter.findByEmail(email);

      expect(result?.registrationStatus).toBe(RegistrationStatus.REJECTED);
    });
  });

  describe('findById', () => {
    it('IDが存在する場合にUserを返す', async () => {
      const testUserId = randomUUID();
      const testEmail = `${testEmailPrefix}find-id@example.com`;
      const testPasswordHash =
        '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12';

      const userEntity = userRepository.create({
        id: testUserId,
        email: testEmail,
        password: testPasswordHash,
        role: UserRoleEnum.USER,
      });
      await userRepository.save(userEntity);

      const requestEntity = registrationRequestRepository.create({
        id: randomUUID(),
        userId: testUserId,
        status: RegistrationStatusEnum.APPROVED,
      });
      await registrationRequestRepository.save(requestEntity);

      const id = UserId.create(testUserId);
      const result = await adapter.findById(id);

      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(User);
      expect(result?.id.value).toBe(testUserId);
      expect(result?.email.value).toBe(testEmail);
      expect(result?.registrationStatus).toBe(RegistrationStatus.APPROVED);
    });

    it('IDが存在しない場合にnullを返す', async () => {
      const id = UserId.create(randomUUID());
      const result = await adapter.findById(id);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('全ユーザーを返す', async () => {
      const testUserId1 = randomUUID();
      const testEmail1 = `${testEmailPrefix}findall-1@example.com`;
      const testUserId2 = randomUUID();
      const testEmail2 = `${testEmailPrefix}findall-2@example.com`;
      const testPasswordHash =
        '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12';

      const user1 = userRepository.create({
        id: testUserId1,
        email: testEmail1,
        password: testPasswordHash,
        role: UserRoleEnum.USER,
      });
      const user2 = userRepository.create({
        id: testUserId2,
        email: testEmail2,
        password: testPasswordHash,
        role: UserRoleEnum.USER,
      });
      await userRepository.save([user1, user2]);

      const request1 = registrationRequestRepository.create({
        id: randomUUID(),
        userId: testUserId1,
        status: RegistrationStatusEnum.PENDING,
      });
      const request2 = registrationRequestRepository.create({
        id: randomUUID(),
        userId: testUserId2,
        status: RegistrationStatusEnum.APPROVED,
      });
      await registrationRequestRepository.save([request1, request2]);

      const result = await adapter.findAll();

      const testUsers = result.filter((u) =>
        u.email.value.startsWith(testEmailPrefix),
      );
      expect(testUsers.length).toBeGreaterThanOrEqual(2);

      const foundUser1 = testUsers.find((u) => u.id.value === testUserId1);
      const foundUser2 = testUsers.find((u) => u.id.value === testUserId2);

      expect(foundUser1).toBeDefined();
      expect(foundUser1?.registrationStatus).toBe(RegistrationStatus.PENDING);
      expect(foundUser2).toBeDefined();
      expect(foundUser2?.registrationStatus).toBe(RegistrationStatus.APPROVED);
    });
  });
});

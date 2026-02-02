import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UserQueryAdapter } from './user-query.adapter';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';
import { UserId } from '../../domain/value-objects/user-id';
import { RegistrationStatus } from '../../domain/enums/registration-status';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('UserQueryAdapter Integration Tests', () => {
  let prismaService: PrismaService;
  let module: TestingModule;
  let adapter: UserQueryAdapter;

  const testUserId = randomUUID();
  const testEmail = 'query-test@example.com';
  const testPasswordHash =
    '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserQueryAdapter,
        PrismaService,
        {
          provide: PrismaClient,
          useExisting: PrismaService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    adapter = module.get<UserQueryAdapter>(UserQueryAdapter);
  });

  beforeEach(async () => {
    await prismaService.userRegistrationRequest.deleteMany({});
    await prismaService.user.deleteMany({});

    // テストユーザーを作成
    await prismaService.user.create({
      data: {
        id: testUserId,
        email: testEmail,
        password: testPasswordHash,
        registrationRequests: {
          create: {
            status: 'APPROVED',
          },
        },
      },
    });
  });

  afterAll(async () => {
    await prismaService.userRegistrationRequest.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.$disconnect();
    await module.close();
  });

  describe('findByEmail', () => {
    it('should return a user when email exists', async () => {
      const email = Email.create(testEmail);
      const result = await adapter.findByEmail(email);

      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(User);
      expect(result?.email.value).toBe(testEmail);
      expect(result?.id.value).toBe(testUserId);
      expect(result?.registrationStatus).toBe(RegistrationStatus.APPROVED);
    });

    it('should return null when email does not exist', async () => {
      const email = Email.create('nonexistent@example.com');
      const result = await adapter.findByEmail(email);

      expect(result).toBeNull();
    });

    it('should return the latest registration status', async () => {
      // 追加のRegistrationRequestを作成（REJECTEDに変更）
      await prismaService.userRegistrationRequest.create({
        data: {
          userId: testUserId,
          status: 'REJECTED',
        },
      });

      const email = Email.create(testEmail);
      const result = await adapter.findByEmail(email);

      expect(result?.registrationStatus).toBe(RegistrationStatus.REJECTED);
    });
  });

  describe('findById', () => {
    it('should return a user when id exists', async () => {
      const id = UserId.create(testUserId);
      const result = await adapter.findById(id);

      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(User);
      expect(result?.id.value).toBe(testUserId);
      expect(result?.email.value).toBe(testEmail);
      expect(result?.registrationStatus).toBe(RegistrationStatus.APPROVED);
    });

    it('should return null when id does not exist', async () => {
      const id = UserId.create(randomUUID());
      const result = await adapter.findById(id);

      expect(result).toBeNull();
    });
  });
});

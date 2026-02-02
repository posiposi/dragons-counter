import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UserCommandAdapter } from './user-command.adapter';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { UserId } from '../../domain/value-objects/user-id';
import { RegistrationStatus } from '../../domain/enums/registration-status';
import { PrismaClient } from '@prisma/client';

describe('UserCommandAdapter Integration Tests', () => {
  let prismaService: PrismaService;
  let module: TestingModule;
  let adapter: UserCommandAdapter;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserCommandAdapter,
        PrismaService,
        {
          provide: PrismaClient,
          useExisting: PrismaService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    adapter = module.get<UserCommandAdapter>(UserCommandAdapter);
  });

  afterEach(async () => {
    await prismaService.userRegistrationRequest.deleteMany({});
    await prismaService.user.deleteMany({});
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await module.close();
  });

  describe('save', () => {
    it('should save a new user with PENDING registration request', async () => {
      const email = Email.create('test-command@example.com');
      const password = await Password.fromPlainText('password123');
      const user = User.createNew(email, password);

      const result = await adapter.save(user);

      expect(result).toBeInstanceOf(User);
      expect(result.id.value).toBe(user.id.value);
      expect(result.email.value).toBe('test-command@example.com');
      expect(result.registrationStatus).toBe(RegistrationStatus.PENDING);

      // DBに保存されていることを確認
      const savedUser = await prismaService.user.findUnique({
        where: { id: user.id.value },
        include: { registrationRequests: true },
      });
      expect(savedUser).not.toBeNull();
      expect(savedUser?.email).toBe('test-command@example.com');
      expect(savedUser?.registrationRequests).toHaveLength(1);
      expect(savedUser?.registrationRequests[0].status).toBe('PENDING');
    });

    it('should save password as hashed value', async () => {
      const email = Email.create('hash-test@example.com');
      const password = await Password.fromPlainText('password123');
      const user = User.createNew(email, password);

      await adapter.save(user);

      const savedUser = await prismaService.user.findUnique({
        where: { id: user.id.value },
      });
      expect(savedUser?.password).not.toBe('password123');
      expect(savedUser?.password).toBe(password.hash);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StadiumAdapter } from './stadium.adapter';
import { Stadium } from '../../domain/entities/stadium';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('StadiumAdapter Integration Tests', () => {
  let prismaService: PrismaService;
  let module: TestingModule;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        StadiumAdapter,
        PrismaService,
        {
          provide: PrismaClient,
          useExisting: PrismaService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    prismaClient = prismaService;

    await prismaService.stadium.deleteMany();
  });

  afterAll(async () => {
    await prismaService.stadium.deleteMany();
    await prismaService.$disconnect();
    await module.close();
  });

  describe('findAll', () => {
    it('should return all stadiums', async () => {
      await prismaService.stadium.deleteMany();

      const stadium1Id = randomUUID();
      const stadium2Id = randomUUID();

      await prismaService.stadium.createMany({
        data: [
          {
            id: stadium1Id,
            name: 'バンテリンドーム',
            isDefault: true,
          },
          {
            id: stadium2Id,
            name: '甲子園',
            isDefault: false,
          },
        ],
      });

      const adapter = new StadiumAdapter(prismaClient);
      const result = await adapter.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Stadium);
      expect(result[1]).toBeInstanceOf(Stadium);

      const names = result.map((s) => s.name.value);
      expect(names).toContain('バンテリンドーム');
      expect(names).toContain('甲子園');
    });

    it('should return empty array when no stadiums exist', async () => {
      await prismaService.stadium.deleteMany();

      const adapter = new StadiumAdapter(prismaClient);
      const result = await adapter.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findDefault', () => {
    it('should return default stadium when exists', async () => {
      await prismaService.stadium.deleteMany();

      const defaultStadiumId = randomUUID();
      const otherStadiumId = randomUUID();

      await prismaService.stadium.createMany({
        data: [
          {
            id: defaultStadiumId,
            name: 'バンテリンドーム',
            isDefault: true,
          },
          {
            id: otherStadiumId,
            name: '甲子園',
            isDefault: false,
          },
        ],
      });

      const adapter = new StadiumAdapter(prismaClient);
      const result = await adapter.findDefault();

      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Stadium);
      expect(result?.id.value).toBe(defaultStadiumId);
      expect(result?.name.value).toBe('バンテリンドーム');
      expect(result?.isDefault).toBe(true);
    });

    it('should return null when no default stadium exists', async () => {
      await prismaService.stadium.deleteMany();

      const stadiumId = randomUUID();

      await prismaService.stadium.create({
        data: {
          id: stadiumId,
          name: '甲子園',
          isDefault: false,
        },
      });

      const adapter = new StadiumAdapter(prismaClient);
      const result = await adapter.findDefault();

      expect(result).toBeNull();
    });

    it('should return null when no stadiums exist', async () => {
      await prismaService.stadium.deleteMany();

      const adapter = new StadiumAdapter(prismaClient);
      const result = await adapter.findDefault();

      expect(result).toBeNull();
    });
  });
});

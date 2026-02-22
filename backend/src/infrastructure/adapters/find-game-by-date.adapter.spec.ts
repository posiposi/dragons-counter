import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindGameByDateAdapter } from './find-game-by-date.adapter';
import { GameDate } from '../../domain/value-objects/game-date';
import { GameEntity } from '../typeorm/entities/game.entity';
import { StadiumEntity } from '../typeorm/entities/stadium.entity';
import { GameResultEnum } from '../typeorm/enums/game-result.enum';
import { createDataSourceOptions } from '../typeorm/data-source';
import { randomUUID } from 'crypto';

describe('FindGameByDateAdapter Integration Tests', () => {
  let module: TestingModule;
  let adapter: FindGameByDateAdapter;
  let gameRepository: Repository<GameEntity>;
  let stadiumRepository: Repository<StadiumEntity>;

  // 固定のスタジアムID（find-game-by-date専用）
  const testStadiums = {
    vantelin: {
      id: '22222222-find-0001-0001-000000000001',
      name: 'バンテリンドーム_findbydate',
    },
  };

  beforeAll(async () => {
    const dataSourceOptions = createDataSourceOptions(
      process.env.DATABASE_URL ?? '',
    );

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dataSourceOptions),
        TypeOrmModule.forFeature([GameEntity, StadiumEntity]),
      ],
      providers: [FindGameByDateAdapter],
    }).compile();

    adapter = module.get<FindGameByDateAdapter>(FindGameByDateAdapter);
    gameRepository = module.get<Repository<GameEntity>>(
      getRepositoryToken(GameEntity),
    );
    stadiumRepository = module.get<Repository<StadiumEntity>>(
      getRepositoryToken(StadiumEntity),
    );

    // スタジアムをupsertで作成（並列実行でもCIエラーにならないように）
    for (const stadium of Object.values(testStadiums)) {
      await stadiumRepository.save(
        stadiumRepository.create({
          id: stadium.id,
          name: stadium.name,
        }),
      );
    }
  });

  afterEach(async () => {
    const stadiumIds = Object.values(testStadiums).map((s) => s.id);
    await gameRepository
      .createQueryBuilder()
      .delete()
      .where('stadiumId IN (:...ids)', { ids: stadiumIds })
      .execute();
  });

  afterAll(async () => {
    const stadiumIds = Object.values(testStadiums).map((s) => s.id);
    await gameRepository
      .createQueryBuilder()
      .delete()
      .where('stadiumId IN (:...ids)', { ids: stadiumIds })
      .execute();
    await stadiumRepository
      .createQueryBuilder()
      .delete()
      .where('id IN (:...ids)', { ids: stadiumIds })
      .execute();
    await module.close();
  });

  describe('findByDate', () => {
    it('should return a game when matching date exists', async () => {
      const testGameId = randomUUID();
      const testDate = new Date('2024-07-01');

      await gameRepository.save(
        gameRepository.create({
          id: testGameId,
          gameDate: testDate,
          opponent: '阪神タイガース',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultEnum.WIN,
        }),
      );

      const result = await adapter.findByDate(new GameDate(testDate));

      expect(result).not.toBeNull();
      expect(result?.id.value).toBe(testGameId);
      expect(result?.opponent.value).toBe('阪神タイガース');
    });

    it('should return null when no matching game exists', async () => {
      const result = await adapter.findByDate(
        new GameDate(new Date('2024-07-01')),
      );

      expect(result).toBeNull();
    });

    it('should return null when date does not match', async () => {
      await gameRepository.save(
        gameRepository.create({
          id: randomUUID(),
          gameDate: new Date('2024-07-01'),
          opponent: '阪神タイガース',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultEnum.WIN,
        }),
      );

      const result = await adapter.findByDate(
        new GameDate(new Date('2024-07-02')),
      );

      expect(result).toBeNull();
    });

    it('should exclude soft-deleted games', async () => {
      const testDate = new Date('2024-07-01');

      await gameRepository.save(
        gameRepository.create({
          id: randomUUID(),
          gameDate: testDate,
          opponent: '阪神タイガース',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultEnum.WIN,
          deletedAt: new Date(),
        }),
      );

      const result = await adapter.findByDate(new GameDate(testDate));

      expect(result).toBeNull();
    });
  });
});

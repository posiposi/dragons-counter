import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BulkCreateGameAdapter } from './bulk-create-game.adapter';
import { Game } from '../../domain/entities/game';
import { GameId } from '../../domain/value-objects/game-id';
import { Score } from '../../domain/value-objects/score';
import { Opponent } from '../../domain/value-objects/opponent';
import { Stadium } from '../../domain/value-objects/stadium';
import { StadiumId } from '../../domain/value-objects/stadium-id';
import { StadiumName } from '../../domain/value-objects/stadium-name';
import { Notes } from '../../domain/value-objects/notes';
import { GameDate } from '../../domain/value-objects/game-date';
import { GameResultValue } from '../../domain/value-objects/game-result';
import { GameEntity } from '../typeorm/entities/game.entity';
import { StadiumEntity } from '../typeorm/entities/stadium.entity';
import { createDataSourceOptions } from '../typeorm/data-source';
import { randomUUID } from 'crypto';

describe('BulkCreateGameAdapter Integration Tests', () => {
  let module: TestingModule;
  let adapter: BulkCreateGameAdapter;
  let gameRepository: Repository<GameEntity>;
  let stadiumRepository: Repository<StadiumEntity>;

  // 固定のスタジアムID（bulk-create-game専用）
  const testStadiums = {
    vantelin: {
      id: '11111111-bulk-0001-0001-000000000001',
      name: 'バンテリンドーム_bulk',
    },
    koshien: {
      id: '11111111-bulk-0001-0001-000000000002',
      name: '甲子園_bulk',
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
      providers: [BulkCreateGameAdapter],
    }).compile();

    adapter = module.get<BulkCreateGameAdapter>(BulkCreateGameAdapter);
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

  describe('save', () => {
    it('should save a game successfully', async () => {
      const gameId = new GameId(randomUUID());
      const stadium = Stadium.create(
        StadiumId.create(testStadiums.vantelin.id),
        StadiumName.create(testStadiums.vantelin.name),
      );
      const game = new Game(
        gameId,
        new GameDate(new Date('2024-04-01')),
        new Opponent('阪神タイガース'),
        new Score(5),
        new Score(3),
        stadium,
        undefined,
        new Date('2024-04-01'),
        new Date('2024-04-01'),
      );

      await adapter.save(game);

      const savedGame = await gameRepository.findOne({
        where: { id: gameId.value },
      });

      expect(savedGame).not.toBeNull();
      expect(savedGame?.opponent).toBe('阪神タイガース');
      expect(savedGame?.dragonsScore).toBe(5);
      expect(savedGame?.opponentScore).toBe(3);
      expect(savedGame?.stadiumId).toBe(testStadiums.vantelin.id);
      expect(savedGame?.result).toBe(GameResultValue.WIN.toLowerCase());
    });

    it('should save a game with notes', async () => {
      const gameId = new GameId(randomUUID());
      const stadium = Stadium.create(
        StadiumId.create(testStadiums.vantelin.id),
        StadiumName.create(testStadiums.vantelin.name),
      );
      const game = new Game(
        gameId,
        new GameDate(new Date('2024-04-01')),
        new Opponent('阪神タイガース'),
        new Score(5),
        new Score(3),
        stadium,
        new Notes('開幕戦勝利！'),
        new Date('2024-04-01'),
        new Date('2024-04-01'),
      );

      await adapter.save(game);

      const savedGame = await gameRepository.findOne({
        where: { id: gameId.value },
      });

      expect(savedGame?.notes).toBe('開幕戦勝利！');
    });
  });
});

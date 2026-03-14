import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGameModule } from './user-game.module';
import { UserGameEntity } from '../infrastructure/typeorm/entities/user-game.entity';
import { GameEntity } from '../infrastructure/typeorm/entities/game.entity';
import { StadiumEntity } from '../infrastructure/typeorm/entities/stadium.entity';
import { UserGameCommandPort } from '../domain/ports/user-game-command.port';
import { UserGameQueryPort } from '../domain/ports/user-game-query.port';
import type { GamePort } from '../domain/ports/game.port';
import { RegisterUserGameUsecase } from '../domain/usecases/register-user-game.usecase';
import { GetUserGamesUsecase } from '../domain/usecases/get-user-games.usecase';
import { RegisterUserGameController } from './controllers/register-user-game.controller';
import { GetUserGamesController } from './controllers/get-user-games.controller';

describe('UserGameModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [UserGameModule],
    })
      .overrideProvider('UserGameCommandPort')
      .useValue({})
      .overrideProvider('UserGameQueryPort')
      .useValue({})
      .overrideProvider('GamePort')
      .useValue({})
      .overrideProvider(getRepositoryToken(UserGameEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(GameEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(StadiumEntity))
      .useValue({})
      .compile();
  });

  it('UserGameEntityのRepositoryトークンが解決される', () => {
    const repository = module.get<Repository<UserGameEntity>>(
      getRepositoryToken(UserGameEntity),
    );
    expect(repository).toBeDefined();
  });

  it('UserGameCommandPortトークンが解決される', () => {
    const port = module.get<UserGameCommandPort>('UserGameCommandPort');
    expect(port).toBeDefined();
  });

  it('UserGameQueryPortトークンが解決される', () => {
    const port = module.get<UserGameQueryPort>('UserGameQueryPort');
    expect(port).toBeDefined();
  });

  it('RegisterUserGameUsecaseが解決される', () => {
    const usecase = module.get<RegisterUserGameUsecase>(
      RegisterUserGameUsecase,
    );
    expect(usecase).toBeDefined();
  });

  it('GetUserGamesUsecaseが解決される', () => {
    const usecase = module.get<GetUserGamesUsecase>(GetUserGamesUsecase);
    expect(usecase).toBeDefined();
  });

  it('RegisterUserGameControllerが解決される', () => {
    const controller = module.get<RegisterUserGameController>(
      RegisterUserGameController,
    );
    expect(controller).toBeDefined();
  });

  it('GetUserGamesControllerが解決される', () => {
    const controller = module.get<GetUserGamesController>(
      GetUserGamesController,
    );
    expect(controller).toBeDefined();
  });

  it('GamePortトークンがGameModule経由で解決される', () => {
    const port = module.get<GamePort>('GamePort');
    expect(port).toBeDefined();
  });
});

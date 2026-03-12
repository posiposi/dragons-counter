import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGameModule } from './user-game.module';
import { UserGameEntity } from '../infrastructure/typeorm/entities/user-game.entity';
import { UserGameCommandPort } from '../domain/ports/user-game-command.port';
import { UserGameQueryPort } from '../domain/ports/user-game-query.port';

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
      .overrideProvider(getRepositoryToken(UserGameEntity))
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
});

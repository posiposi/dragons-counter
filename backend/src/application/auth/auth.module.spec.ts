import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthModule } from './auth.module';
import { UserEntity } from '../../infrastructure/typeorm/entities/user.entity';
import { UserRegistrationRequestEntity } from '../../infrastructure/typeorm/entities/user-registration-request.entity';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider('UserCommandPort')
      .useValue({})
      .overrideProvider('UserQueryPort')
      .useValue({})
      .overrideProvider('TokenServicePort')
      .useValue({})
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(UserRegistrationRequestEntity))
      .useValue({})
      .compile();
  });

  it('UserEntityのRepositoryトークンが解決される', () => {
    const repository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    expect(repository).toBeDefined();
  });

  it('UserRegistrationRequestEntityのRepositoryトークンが解決される', () => {
    const repository = module.get<Repository<UserRegistrationRequestEntity>>(
      getRepositoryToken(UserRegistrationRequestEntity),
    );
    expect(repository).toBeDefined();
  });
});

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserQueryPort } from '../../domain/ports/user-query.port';
import { User } from '../../domain/entities/user';
import { UserId } from '../../domain/value-objects/user-id';
import { Email } from '../../domain/value-objects/email';
import { UserEntity } from '../typeorm/entities/user.entity';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class UserQueryAdapter implements UserQueryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: email.value },
      relations: { registrationRequests: true },
      order: { registrationRequests: { createdAt: 'DESC' } },
    });

    if (!user) {
      return null;
    }

    return UserMapper.toDomainEntity(user);
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: id.value },
      relations: { registrationRequests: true },
      order: { registrationRequests: { createdAt: 'DESC' } },
    });

    if (!user) {
      return null;
    }

    return UserMapper.toDomainEntity(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      relations: { registrationRequests: true },
      order: { registrationRequests: { createdAt: 'DESC' } },
    });

    return users.map((user) => UserMapper.toDomainEntity(user));
  }
}

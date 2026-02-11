import { Injectable, Inject } from '@nestjs/common';
import type { UserQueryPort } from '../ports/user-query.port';
import type { User } from '../entities/user';
import { UserResponseDto } from '../../application/auth/dto/user-response.dto';

@Injectable()
export class GetUsersUsecase {
  constructor(
    @Inject('UserQueryPort')
    private readonly userQueryPort: UserQueryPort,
  ) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.userQueryPort.findAll();
    return users.map((user) => this.toDto(user));
  }

  private toDto(user: User): UserResponseDto {
    return {
      id: user.id.value,
      email: user.email.value,
      registrationStatus: user.registrationStatus,
      role: user.role,
    };
  }
}

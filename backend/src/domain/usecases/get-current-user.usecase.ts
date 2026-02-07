import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { UserQueryPort } from '../ports/user-query.port';
import { UserId } from '../value-objects/user-id';
import type { User } from '../entities/user';
import { UserResponseDto } from '../../application/auth/dto/user-response.dto';

@Injectable()
export class GetCurrentUserUsecase {
  constructor(
    @Inject('UserQueryPort')
    private readonly userQueryPort: UserQueryPort,
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userQueryPort.findById(UserId.create(userId));
    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません');
    }
    return this.toDto(user);
  }

  private toDto(user: User): UserResponseDto {
    return {
      id: user.id.value,
      email: user.email.value,
      registrationStatus: user.registrationStatus,
    };
  }
}

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { UserCommandPort } from '../ports/user-command.port';
import type { UserQueryPort } from '../ports/user-query.port';
import { UserId } from '../value-objects/user-id';

@Injectable()
export class ApproveUserUsecase {
  constructor(
    @Inject('UserCommandPort')
    private readonly userCommandPort: UserCommandPort,
    @Inject('UserQueryPort')
    private readonly userQueryPort: UserQueryPort,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userQueryPort.findById(UserId.create(userId));
    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    const approvedUser = user.approve();
    await this.userCommandPort.updateRegistrationStatus(approvedUser);
  }
}

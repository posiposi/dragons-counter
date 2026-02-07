import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserCommandPort } from '../../domain/ports/user-command.port';
import { User } from '../../domain/entities/user';
import { UserId } from '../../domain/value-objects/user-id';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { RegistrationStatus } from '../../domain/enums/registration-status';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';

@Injectable()
export class UserCommandAdapter implements UserCommandPort {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<User> {
    try {
      const savedUser = await this.prisma.user.upsert({
        where: { id: user.id.value },
        update: {
          email: user.email.value,
          password: user.password.hash,
        },
        create: {
          id: user.id.value,
          email: user.email.value,
          password: user.password.hash,
          registrationRequests: {
            create: {
              status: RegistrationStatus.toPrisma(user.registrationStatus),
            },
          },
        },
        include: {
          registrationRequests: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const latestStatus = savedUser.registrationRequests[0]?.status;

      return User.fromRepository(
        UserId.create(savedUser.id),
        Email.create(savedUser.email),
        Password.fromHash(savedUser.password),
        RegistrationStatus.fromPrisma(latestStatus),
      );
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new UserAlreadyExistsException(
          `User with email ${user.email.value} already exists`,
        );
      }
      throw error;
    }
  }
}

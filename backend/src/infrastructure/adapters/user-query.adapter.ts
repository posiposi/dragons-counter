import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  User as PrismaUser,
  UserRegistrationRequest as PrismaUserRegistrationRequest,
} from '@prisma/client';
import { UserQueryPort } from '../../domain/ports/user-query.port';
import { User } from '../../domain/entities/user';
import { UserId } from '../../domain/value-objects/user-id';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { RegistrationStatus } from '../../domain/enums/registration-status';
import { UserRole } from '../../domain/enums/user-role';

type PrismaUserWithRequests = PrismaUser & {
  registrationRequests: PrismaUserRegistrationRequest[];
};

@Injectable()
export class UserQueryAdapter implements UserQueryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.value },
      include: {
        registrationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return null;
    }

    return this.toDomainEntity(user);
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.value },
      include: {
        registrationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return null;
    }

    return this.toDomainEntity(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      include: {
        registrationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return users.map((user) => this.toDomainEntity(user));
  }

  private toDomainEntity(data: PrismaUserWithRequests): User {
    const latestStatus = data.registrationRequests[0]?.status;

    return User.fromRepository(
      UserId.create(data.id),
      Email.create(data.email),
      Password.fromHash(data.password),
      RegistrationStatus.fromPrisma(latestStatus),
      UserRole.fromPrisma(data.role),
    );
  }
}

# ドメイン層コード例

SKILL.mdで定義した規約に基づく具体的なコード例を示す。

## 値オブジェクト (Value Object)

```typescript
// src/domain/value-objects/email.ts

export class Email {
  private constructor(private readonly _value: string) {}

  static create(value: string): Email {
    if (!value) {
      throw new InvalidEmailException("メールアドレスは必須です");
    }
    if (!this.isValidFormat(value)) {
      throw new InvalidEmailException("メールアドレスの形式が不正です");
    }
    return new Email(value);
  }

  private static isValidFormat(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  get value(): string {
    return this._value;
  }
}
```

### 識別子用の値オブジェクト

```typescript
// src/domain/value-objects/user-id.ts

import { randomUUID } from "crypto";

export class UserId {
  private constructor(private readonly _value: string) {}

  static create(): UserId {
    return new UserId(randomUUID());
  }

  static reconstruct(value: string): UserId {
    if (!value) {
      throw new Error("UserIdは必須です");
    }
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  get value(): string {
    return this._value;
  }
}
```

## エンティティ (Entity)

```typescript
// src/domain/entities/user.ts

import { UserId } from "../value-objects/user-id";
import { Email } from "../value-objects/email";
import { HashedPassword } from "../value-objects/hashed-password";

interface UserProps {
  id: UserId;
  email: Email;
  hashedPassword: HashedPassword;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(params: {
    email: Email;
    hashedPassword: HashedPassword;
  }): User {
    const now = new Date();
    return new User({
      id: UserId.create(),
      email: params.email,
      hashedPassword: params.hashedPassword,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(params: {
    id: UserId;
    email: Email;
    hashedPassword: HashedPassword;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User({
      id: params.id,
      email: params.email,
      hashedPassword: params.hashedPassword,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    });
  }

  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get hashedPassword(): HashedPassword {
    return this.props.hashedPassword;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  changeEmail(newEmail: Email): User {
    return new User({
      ...this.props,
      email: newEmail,
      updatedAt: new Date(),
    });
  }

  changePassword(newHashedPassword: HashedPassword): User {
    return new User({
      ...this.props,
      hashedPassword: newHashedPassword,
      updatedAt: new Date(),
    });
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}
```

## 集約 (Aggregate)

集約は複数のエンティティと値オブジェクトをまとめた整合性の境界。集約ルートを通じてのみアクセスする。

```typescript
// src/domain/aggregates/order/order.ts

import { OrderId } from "./order-id";
import { OrderItem } from "./order-item";
import { UserId } from "../../value-objects/user-id";
import { OrderStatus } from "./order-status";

interface OrderProps {
  id: OrderId;
  userId: UserId;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  private constructor(private readonly props: OrderProps) {}

  static create(params: { userId: UserId; items: OrderItem[] }): Order {
    if (params.items.length === 0) {
      throw new EmptyOrderException("注文には少なくとも1つの商品が必要です");
    }

    const now = new Date();
    return new Order({
      id: OrderId.create(),
      userId: params.userId,
      items: [...params.items],
      status: OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(params: OrderProps): Order {
    return new Order({
      ...params,
      items: [...params.items],
    });
  }

  get id(): OrderId {
    return this.props.id;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get items(): ReadonlyArray<OrderItem> {
    return [...this.props.items];
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  confirm(): Order {
    if (this.status !== OrderStatus.PENDING) {
      throw new InvalidOrderStatusException(
        "確定できるのは保留中の注文のみです",
      );
    }
    return new Order({
      ...this.props,
      status: OrderStatus.CONFIRMED,
      updatedAt: new Date(),
    });
  }

  cancel(): Order {
    if (this.status === OrderStatus.SHIPPED) {
      throw new InvalidOrderStatusException(
        "発送済みの注文はキャンセルできません",
      );
    }
    return new Order({
      ...this.props,
      status: OrderStatus.CANCELLED,
      updatedAt: new Date(),
    });
  }

  equals(other: Order): boolean {
    return this.id.equals(other.id);
  }
}
```

## ドメインサービス (Domain Service)

```typescript
// src/domain/services/password-hash-service.ts

export interface PasswordHashService {
  hash(plainPassword: string): Promise<string>;
  verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
```

## Command Port

```typescript
// src/domain/ports/command/user-command-port.ts

import { User } from "../../entities/user";
import { UserId } from "../../value-objects/user-id";

export interface UserCommandPort {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  delete(id: UserId): Promise<void>;
}
```

## Query Port

```typescript
// src/domain/ports/query/user-query-port.ts

export interface UserDto {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListQueryParams {
  page: number;
  limit: number;
  sortBy?: "createdAt" | "email";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserQueryPort {
  findById(id: string): Promise<UserDto | null>;
  findByEmail(email: string): Promise<UserDto | null>;
  findAll(params: UserListQueryParams): Promise<PaginatedResult<UserDto>>;
  existsByEmail(email: string): Promise<boolean>;
}
```

## ドメイン例外 (Domain Exception)

### 基底クラス

```typescript
// src/domain/exceptions/domain-exception.ts

export abstract class DomainException extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

### 具体的な例外クラス

```typescript
// src/domain/exceptions/invalid-email-exception.ts

import { DomainException } from "./domain-exception";

export class InvalidEmailException extends DomainException {
  constructor(message: string) {
    super("INVALID_EMAIL", message);
  }
}
```

```typescript
// src/domain/exceptions/user-not-found-exception.ts

import { DomainException } from "./domain-exception";

export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super("USER_NOT_FOUND", `ユーザーが見つかりません: ${userId}`);
  }
}
```

```typescript
// src/domain/exceptions/email-already-exists-exception.ts

import { DomainException } from "./domain-exception";

export class EmailAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(
      "EMAIL_ALREADY_EXISTS",
      `このメールアドレスは既に使用されています: ${email}`,
    );
  }
}
```

---

# Adapter層コード例

## Mapper

Mapperはドメインオブジェクトと永続化モデル間の変換ロジックを集約する。Command AdapterとQuery Adapterの両方から利用し、マッピングの重複を排除する。

```typescript
// src/infrastructure/adapters/mappers/user.mapper.ts

import { User } from "../../../domain/entities/user";
import { UserId } from "../../../domain/value-objects/user-id";
import { Email } from "../../../domain/value-objects/email";
import { HashedPassword } from "../../../domain/value-objects/hashed-password";
import { UserEntity } from "../../typeorm/entities/user.entity";

export class UserMapper {
  static toDomainEntity(data: UserEntity): User {
    return User.reconstruct({
      id: UserId.reconstruct(data.id),
      email: Email.create(data.email),
      hashedPassword: HashedPassword.reconstruct(data.hashedPassword),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toPersistence(user: User): Partial<UserEntity> {
    return {
      id: user.id.value,
      email: user.email.value,
      hashedPassword: user.hashedPassword.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
```

enum変換が必要な場合は、Mapperクラスに静的メソッドとして追加する:

```typescript
// enum変換の例（ドメインenum ↔ 永続化enum）

import { RegistrationStatus, RegistrationStatusType } from "../../../domain/enums/registration-status";
import { RegistrationStatusEnum } from "../../typeorm/enums/registration-status.enum";

export class UserMapper {
  // ... toDomainEntity, toPersistence ...

  static toRegistrationStatusEnum(status: RegistrationStatusType): RegistrationStatusEnum {
    const map: Record<string, RegistrationStatusEnum> = {
      [RegistrationStatus.PENDING]: RegistrationStatusEnum.PENDING,
      [RegistrationStatus.APPROVED]: RegistrationStatusEnum.APPROVED,
    };
    const result = map[status];
    if (!result) {
      throw new Error(`Unknown RegistrationStatus: ${status}`);
    }
    return result;
  }

  static fromRegistrationStatusEnum(status: RegistrationStatusEnum): RegistrationStatusType {
    const map: Record<string, RegistrationStatusType> = {
      [RegistrationStatusEnum.PENDING]: RegistrationStatus.PENDING,
      [RegistrationStatusEnum.APPROVED]: RegistrationStatus.APPROVED,
    };
    const result = map[status];
    if (!result) {
      throw new Error(`Unknown RegistrationStatusEnum: ${status}`);
    }
    return result;
  }
}
```

## Command Adapter

Mapperに変換を委譲し、Adapter自体はデータアクセスとトランザクション制御に集中する。

```typescript
// src/infrastructure/adapters/command/user-command-adapter.ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { UserCommandPort } from "../../../domain/ports/command/user-command-port";
import { User } from "../../../domain/entities/user";
import { UserId } from "../../../domain/value-objects/user-id";
import { UserEntity } from "../../typeorm/entities/user.entity";
import { UserMapper } from "../mappers/user.mapper";

@Injectable()
export class UserCommandAdapter implements UserCommandPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async save(user: User): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const entity = this.userRepository.create(UserMapper.toPersistence(user));
      await manager.save(UserEntity, entity);
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const record = await this.userRepository.findOne({
      where: { id: id.value },
    });

    if (!record) {
      return null;
    }

    return UserMapper.toDomainEntity(record);
  }

  async delete(id: UserId): Promise<void> {
    await this.userRepository.delete({ id: id.value });
  }
}
```

## Query Adapter

```typescript
// src/infrastructure/adapters/query/user-query-adapter.ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserQueryPort, UserDto } from "../../../domain/ports/query/user-query-port";
import { UserEntity } from "../../typeorm/entities/user.entity";
import { UserMapper } from "../mappers/user.mapper";

@Injectable()
export class UserQueryAdapter implements UserQueryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserDto | null> {
    const record = await this.userRepository.findOne({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return UserMapper.toDto(record);
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    const record = await this.userRepository.findOne({
      where: { email },
    });

    if (!record) {
      return null;
    }

    return UserMapper.toDto(record);
  }
}
```

## ドメインサービス Adapter

```typescript
// src/infrastructure/adapters/services/password-hash-service-adapter.ts

import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PasswordHashService } from "../../../domain/services/password-hash-service";

@Injectable()
export class PasswordHashServiceAdapter implements PasswordHashService {
  private readonly SALT_ROUNDS = 10;

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
  }

  async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
```

## NestJS モジュール連携

```typescript
// src/user.module.ts

import { Module } from "@nestjs/common";
import { UserCommandAdapter } from "./infrastructure/adapters/command/user-command-adapter";
import { UserQueryAdapter } from "./infrastructure/adapters/query/user-query-adapter";
import { PasswordHashServiceAdapter } from "./infrastructure/adapters/services/password-hash-service-adapter";

@Module({
  providers: [
    {
      provide: "UserCommandPort",
      useClass: UserCommandAdapter,
    },
    {
      provide: "UserQueryPort",
      useClass: UserQueryAdapter,
    },
    {
      provide: "PasswordHashService",
      useClass: PasswordHashServiceAdapter,
    },
  ],
  exports: ["UserCommandPort", "UserQueryPort", "PasswordHashService"],
})
export class UserModule {}
```

---

# UseCase層コード例

## Command UseCase

### ユーザー登録

```typescript
// src/domain/usecases/command/register-user.usecase.ts

import { Injectable, Inject } from "@nestjs/common";
import type { UserCommandPort } from "../../ports/command/user-command-port";
import type { UserQueryPort } from "../../ports/query/user-query-port";
import type { PasswordHashService } from "../../services/password-hash-service";
import { User } from "../../entities/user";
import { Email } from "../../value-objects/email";
import { HashedPassword } from "../../value-objects/hashed-password";
import { EmailAlreadyExistsException } from "../../exceptions/email-already-exists-exception";

@Injectable()
export class RegisterUserUsecase {
  constructor(
    @Inject("UserCommandPort")
    private readonly userCommandPort: UserCommandPort,
    @Inject("UserQueryPort")
    private readonly userQueryPort: UserQueryPort,
    @Inject("PasswordHashService")
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async execute(input: { email: string; password: string }): Promise<void> {
    const emailExists = await this.userQueryPort.existsByEmail(input.email);
    if (emailExists) {
      throw new EmailAlreadyExistsException(input.email);
    }

    const email = Email.create(input.email);
    const hashedValue = await this.passwordHashService.hash(input.password);
    const hashedPassword = HashedPassword.create(hashedValue);

    const user = User.create({ email, hashedPassword });

    await this.userCommandPort.save(user);
  }
}
```

### ユーザー削除

```typescript
// src/domain/usecases/command/delete-user.usecase.ts

import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import type { UserCommandPort } from "../../ports/command/user-command-port";
import { UserId } from "../../value-objects/user-id";

@Injectable()
export class DeleteUserUsecase {
  constructor(
    @Inject("UserCommandPort")
    private readonly userCommandPort: UserCommandPort,
  ) {}

  async execute(userId: string): Promise<void> {
    const id = UserId.reconstruct(userId);
    const user = await this.userCommandPort.findById(id);

    if (!user) {
      throw new NotFoundException("ユーザーが見つかりません");
    }

    await this.userCommandPort.delete(id);
  }
}
```

## Query UseCase

### ユーザー取得（単一）

```typescript
// src/domain/usecases/query/get-user.usecase.ts

import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import type { UserQueryPort, UserDto } from "../../ports/query/user-query-port";

@Injectable()
export class GetUserUsecase {
  constructor(
    @Inject("UserQueryPort")
    private readonly userQueryPort: UserQueryPort,
  ) {}

  async execute(userId: string): Promise<UserDto> {
    const user = await this.userQueryPort.findById(userId);

    if (!user) {
      throw new NotFoundException("ユーザーが見つかりません");
    }

    return user;
  }
}
```

### ユーザー一覧取得

```typescript
// src/domain/usecases/query/get-users.usecase.ts

import { Injectable, Inject } from "@nestjs/common";
import type {
  UserQueryPort,
  UserDto,
  UserListQueryParams,
  PaginatedResult,
} from "../../ports/query/user-query-port";

@Injectable()
export class GetUsersUsecase {
  constructor(
    @Inject("UserQueryPort")
    private readonly userQueryPort: UserQueryPort,
  ) {}

  async execute(params: UserListQueryParams): Promise<PaginatedResult<UserDto>> {
    return this.userQueryPort.findAll(params);
  }
}
```

## UseCase テスト例

### Command UseCase テスト

```typescript
// src/domain/usecases/command/register-user.usecase.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { RegisterUserUsecase } from "./register-user.usecase";
import { EmailAlreadyExistsException } from "../../exceptions/email-already-exists-exception";

describe("RegisterUserUsecase", () => {
  let usecase: RegisterUserUsecase;
  let mockUserCommandPort: { save: jest.Mock; findById: jest.Mock; delete: jest.Mock };
  let mockUserQueryPort: { existsByEmail: jest.Mock };
  let mockPasswordHashService: { hash: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    mockUserCommandPort = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };
    mockUserQueryPort = {
      existsByEmail: jest.fn(),
    };
    mockPasswordHashService = {
      hash: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUsecase,
        { provide: "UserCommandPort", useValue: mockUserCommandPort },
        { provide: "UserQueryPort", useValue: mockUserQueryPort },
        { provide: "PasswordHashService", useValue: mockPasswordHashService },
      ],
    }).compile();

    usecase = module.get<RegisterUserUsecase>(RegisterUserUsecase);
  });

  it("新規ユーザーを登録できる", async () => {
    mockUserQueryPort.existsByEmail.mockResolvedValue(false);
    mockPasswordHashService.hash.mockResolvedValue("hashed_password");
    mockUserCommandPort.save.mockResolvedValue(undefined);

    await usecase.execute({
      email: "test@example.com",
      password: "password123",
    });

    expect(mockUserQueryPort.existsByEmail).toHaveBeenCalledWith(
      "test@example.com",
    );
    expect(mockPasswordHashService.hash).toHaveBeenCalledWith("password123");
    expect(mockUserCommandPort.save).toHaveBeenCalledTimes(1);
  });

  it("メールアドレスが既に存在する場合は例外をスローする", async () => {
    mockUserQueryPort.existsByEmail.mockResolvedValue(true);

    await expect(
      usecase.execute({
        email: "existing@example.com",
        password: "password123",
      }),
    ).rejects.toThrow(EmailAlreadyExistsException);

    expect(mockUserCommandPort.save).not.toHaveBeenCalled();
  });
});
```

### Query UseCase テスト

```typescript
// src/domain/usecases/query/get-user.usecase.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { GetUserUsecase } from "./get-user.usecase";

describe("GetUserUsecase", () => {
  let usecase: GetUserUsecase;
  let mockUserQueryPort: { findById: jest.Mock };

  beforeEach(async () => {
    mockUserQueryPort = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUsecase,
        { provide: "UserQueryPort", useValue: mockUserQueryPort },
      ],
    }).compile();

    usecase = module.get<GetUserUsecase>(GetUserUsecase);
  });

  it("ユーザーIDでユーザーを取得できる", async () => {
    const expectedDto = {
      id: "user-id-123",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUserQueryPort.findById.mockResolvedValue(expectedDto);

    const result = await usecase.execute("user-id-123");

    expect(result).toEqual(expectedDto);
    expect(mockUserQueryPort.findById).toHaveBeenCalledWith("user-id-123");
  });

  it("ユーザーが見つからない場合はNotFoundExceptionをスローする", async () => {
    mockUserQueryPort.findById.mockResolvedValue(null);

    await expect(usecase.execute("non-existent-id")).rejects.toThrow(
      NotFoundException,
    );
  });
});
```

---

# Controller層コード例

## リクエストDTO

```typescript
// src/application/dto/request/register-user-request.dto.ts

import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterUserRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
```

## レスポンスDTO

Query PortのDTOと構造が同じ場合は再定義しない。API固有の整形が必要な場合のみ定義する。

```typescript
// src/application/dto/response/user-response.dto.ts

export interface UserResponseDto {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
```

## Controller（Command系）

### ユーザー登録

```typescript
// src/application/controllers/register-user.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { RegisterUserUsecase } from "../../domain/usecases/command/register-user.usecase";
import { RegisterUserRequestDto } from "../dto/request/register-user-request.dto";

@Controller("users")
export class RegisterUserController {
  constructor(private readonly registerUserUsecase: RegisterUserUsecase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserRequestDto): Promise<void> {
    await this.registerUserUsecase.execute({
      email: dto.email,
      password: dto.password,
    });
  }
}
```

### ユーザー削除

```typescript
// src/application/controllers/delete-user.controller.ts

import {
  Controller,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { DeleteUserUsecase } from "../../domain/usecases/command/delete-user.usecase";

@Controller("users")
export class DeleteUserController {
  constructor(private readonly deleteUserUsecase: DeleteUserUsecase) {}

  @Delete(":userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("userId") userId: string): Promise<void> {
    await this.deleteUserUsecase.execute(userId);
  }
}
```

## Controller（Query系）

### ユーザー取得（単一）

```typescript
// src/application/controllers/get-user.controller.ts

import { Controller, Get, Param } from "@nestjs/common";
import { GetUserUsecase } from "../../domain/usecases/query/get-user.usecase";
import type { UserDto } from "../../domain/ports/query/user-query-port";

@Controller("users")
export class GetUserController {
  constructor(private readonly getUserUsecase: GetUserUsecase) {}

  @Get(":userId")
  async getUser(@Param("userId") userId: string): Promise<UserDto> {
    return await this.getUserUsecase.execute(userId);
  }
}
```

### ユーザー一覧取得

```typescript
// src/application/controllers/get-users.controller.ts

import { Controller, Get, Query } from "@nestjs/common";
import { GetUsersUsecase } from "../../domain/usecases/query/get-users.usecase";
import type {
  UserDto,
  PaginatedResult,
} from "../../domain/ports/query/user-query-port";

@Controller("users")
export class GetUsersController {
  constructor(private readonly getUsersUsecase: GetUsersUsecase) {}

  @Get()
  async getUsers(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("sortBy") sortBy?: "createdAt" | "email",
    @Query("sortOrder") sortOrder?: "asc" | "desc",
  ): Promise<PaginatedResult<UserDto>> {
    return await this.getUsersUsecase.execute({
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }
}
```

## NestJS モジュール定義

```typescript
// src/application/user.module.ts

import { Module } from "@nestjs/common";
import { RegisterUserController } from "./controllers/register-user.controller";
import { DeleteUserController } from "./controllers/delete-user.controller";
import { GetUserController } from "./controllers/get-user.controller";
import { GetUsersController } from "./controllers/get-users.controller";
import { RegisterUserUsecase } from "../domain/usecases/command/register-user.usecase";
import { DeleteUserUsecase } from "../domain/usecases/command/delete-user.usecase";
import { GetUserUsecase } from "../domain/usecases/query/get-user.usecase";
import { GetUsersUsecase } from "../domain/usecases/query/get-users.usecase";
import { UserCommandAdapter } from "../infrastructure/adapters/command/user-command-adapter";
import { UserQueryAdapter } from "../infrastructure/adapters/query/user-query-adapter";
import { PasswordHashServiceAdapter } from "../infrastructure/adapters/services/password-hash-service-adapter";

@Module({
  controllers: [
    RegisterUserController,
    DeleteUserController,
    GetUserController,
    GetUsersController,
  ],
  providers: [
    // UseCase
    RegisterUserUsecase,
    DeleteUserUsecase,
    GetUserUsecase,
    GetUsersUsecase,
    // Port → Adapter
    {
      provide: "UserCommandPort",
      useClass: UserCommandAdapter,
    },
    {
      provide: "UserQueryPort",
      useClass: UserQueryAdapter,
    },
    {
      provide: "PasswordHashService",
      useClass: PasswordHashServiceAdapter,
    },
  ],
})
export class UserModule {}
```

## Controller テスト例

```typescript
// src/application/controllers/register-user.controller.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { RegisterUserController } from "./register-user.controller";
import { RegisterUserUsecase } from "../../domain/usecases/command/register-user.usecase";

describe("RegisterUserController", () => {
  let controller: RegisterUserController;
  let mockUsecase: { execute: jest.Mock };

  beforeEach(async () => {
    mockUsecase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegisterUserController],
      providers: [
        { provide: RegisterUserUsecase, useValue: mockUsecase },
      ],
    }).compile();

    controller = module.get<RegisterUserController>(RegisterUserController);
  });

  it("UseCaseにリクエストデータを渡して実行する", async () => {
    mockUsecase.execute.mockResolvedValue(undefined);

    await controller.register({
      email: "test@example.com",
      password: "password123",
    });

    expect(mockUsecase.execute).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });
});
```

```typescript
// src/application/controllers/get-user.controller.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { GetUserController } from "./get-user.controller";
import { GetUserUsecase } from "../../domain/usecases/query/get-user.usecase";

describe("GetUserController", () => {
  let controller: GetUserController;
  let mockUsecase: { execute: jest.Mock };

  beforeEach(async () => {
    mockUsecase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetUserController],
      providers: [
        { provide: GetUserUsecase, useValue: mockUsecase },
      ],
    }).compile();

    controller = module.get<GetUserController>(GetUserController);
  });

  it("UseCaseの戻り値をそのまま返却する", async () => {
    const expectedDto = {
      id: "user-id-123",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsecase.execute.mockResolvedValue(expectedDto);

    const result = await controller.getUser("user-id-123");

    expect(result).toEqual(expectedDto);
    expect(mockUsecase.execute).toHaveBeenCalledWith("user-id-123");
  });
});
```

---

# 例外処理コード例

## カスタム例外フィルター

```typescript
// src/application/filters/domain-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { DomainException } from "../../domain/exceptions/domain-exception";

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly STATUS_CODE_MAP: Record<string, HttpStatus> = {
    NOT_FOUND: HttpStatus.NOT_FOUND,
    USER_NOT_FOUND: HttpStatus.NOT_FOUND,
    ALREADY_EXISTS: HttpStatus.CONFLICT,
    EMAIL_ALREADY_EXISTS: HttpStatus.CONFLICT,
    UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
    FORBIDDEN: HttpStatus.FORBIDDEN,
  };

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = this.resolveStatusCode(exception.code);

    response.status(statusCode).json({
      statusCode,
      error: exception.code,
      message: exception.message,
    });
  }

  private resolveStatusCode(code: string): HttpStatus {
    // 完全一致で検索
    if (this.STATUS_CODE_MAP[code]) {
      return this.STATUS_CODE_MAP[code];
    }

    // 部分一致で検索（例: "USER_NOT_FOUND" → "NOT_FOUND"パターン）
    for (const [key, status] of Object.entries(this.STATUS_CODE_MAP)) {
      if (code.endsWith(key)) {
        return status;
      }
    }

    // デフォルトは400 Bad Request
    return HttpStatus.BAD_REQUEST;
  }
}
```

## グローバルフィルター登録

```typescript
// src/main.ts

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { DomainExceptionFilter } from "./application/filters/domain-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new DomainExceptionFilter());

  await app.listen(3000);
}
bootstrap();
```

## 例外フローの動作例

ドメイン層で`InvalidEmailException`がスローされた場合のフロー:

```
1. Email.create("invalid") → InvalidEmailException("INVALID_EMAIL", "メールアドレスの形式が不正です") をスロー
2. UseCase層 → キャッチせずそのまま伝播
3. Controller層 → キャッチせずそのまま伝播
4. DomainExceptionFilter がキャッチ
5. エラーコード "INVALID_EMAIL" → STATUS_CODE_MAP に該当なし → デフォルト 400
6. レスポンス:
   {
     "statusCode": 400,
     "error": "INVALID_EMAIL",
     "message": "メールアドレスの形式が不正です"
   }
```

## 例外フィルター テスト例

```typescript
// src/application/filters/domain-exception.filter.spec.ts

import { DomainExceptionFilter } from "./domain-exception.filter";
import { ArgumentsHost, HttpStatus } from "@nestjs/common";
import { InvalidEmailException } from "../../domain/exceptions/invalid-email-exception";
import { EmailAlreadyExistsException } from "../../domain/exceptions/email-already-exists-exception";
import { UserNotFoundException } from "../../domain/exceptions/user-not-found-exception";

describe("DomainExceptionFilter", () => {
  let filter: DomainExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  it("InvalidEmailExceptionを400 Bad Requestに変換する", () => {
    const exception = new InvalidEmailException("メールアドレスの形式が不正です");

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      error: "INVALID_EMAIL",
      message: "メールアドレスの形式が不正です",
    });
  });

  it("EmailAlreadyExistsExceptionを409 Conflictに変換する", () => {
    const exception = new EmailAlreadyExistsException("test@example.com");

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it("UserNotFoundExceptionを404 Not Foundに変換する", () => {
    const exception = new UserNotFoundException("user-123");

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });
});
```

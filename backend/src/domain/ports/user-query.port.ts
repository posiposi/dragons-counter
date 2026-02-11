import { User } from '../entities/user';
import { Email } from '../value-objects/email';
import { UserId } from '../value-objects/user-id';

export interface UserQueryPort {
  findByEmail(email: Email): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
  findAll(): Promise<User[]>;
}

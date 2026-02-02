import { User } from '../entities/user';

export interface UserCommandPort {
  save(user: User): Promise<User>;
}

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRoleEnum } from '../enums/user-role.enum';
import { UserRegistrationRequestEntity } from './user-registration-request.entity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.USER })
  role: UserRoleEnum;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date = new Date();

  @OneToMany(() => UserRegistrationRequestEntity, (req) => req.user)
  registrationRequests: UserRegistrationRequestEntity[];
}

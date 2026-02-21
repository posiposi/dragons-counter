import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RegistrationStatusEnum } from '../enums/registration-status.enum';
import { UserEntity } from './user.entity';

@Entity('user_registration_requests')
export class UserRegistrationRequestEntity {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 191 })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.registrationRequests)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'enum',
    enum: RegistrationStatusEnum,
    default: RegistrationStatusEnum.PENDING,
  })
  status: RegistrationStatusEnum;

  @Column({ name: 'reasonForRejection', type: 'varchar', nullable: true })
  reasonForRejection: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date = new Date();
}

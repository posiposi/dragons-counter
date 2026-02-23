import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { GameEntity } from './game.entity';

@Entity('users_games')
@Unique('UQ_users_games_user_game', ['userId', 'gameId'])
export class UserGameEntity {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 191 })
  userId: string;

  @Column({ name: 'game_id', type: 'varchar', length: 191 })
  gameId: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  impression: string | null;

  @ManyToOne(() => UserEntity, (user) => user.usersGames)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => GameEntity, (game) => game.usersGames)
  @JoinColumn({ name: 'game_id' })
  game: GameEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date = new Date();

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}

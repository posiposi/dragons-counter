import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { GameResultEnum } from '../enums/game-result.enum';
import { StadiumEntity } from './stadium.entity';
import { UsersGamesEntity } from './user-game.entity';

@Entity('games')
export class GameEntity {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  id: string;

  @Column({ name: 'game_date', type: 'datetime', precision: 3 })
  gameDate: Date;

  @Column({ type: 'varchar' })
  opponent: string;

  @Column({ name: 'dragons_score', type: 'int' })
  dragonsScore: number;

  @Column({ name: 'opponent_score', type: 'int' })
  opponentScore: number;

  @Column({ type: 'enum', enum: GameResultEnum })
  result: GameResultEnum;

  @Column({ name: 'stadium_id', type: 'varchar', length: 191 })
  stadiumId: string;

  @ManyToOne(() => StadiumEntity, (stadium) => stadium.games)
  @JoinColumn({ name: 'stadium_id' })
  stadium: StadiumEntity;

  @Column({ type: 'varchar', length: 191, nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date = new Date();

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => UsersGamesEntity, (usersGames) => usersGames.game)
  usersGames: UsersGamesEntity[];
}

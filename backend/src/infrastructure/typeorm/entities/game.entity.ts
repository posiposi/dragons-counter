import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GameResultEnum } from '../enums/game-result.enum';
import { StadiumEntity } from './stadium.entity';

@Entity('games')
export class GameEntity {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  id: string;

  @Column({ name: 'game_date', type: 'datetime' })
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
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}

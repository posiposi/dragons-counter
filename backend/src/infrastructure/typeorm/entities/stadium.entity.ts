import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GameEntity } from './game.entity';

@Entity('stadiums')
export class StadiumEntity {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => GameEntity, (game) => game.stadium)
  games: GameEntity[];
}

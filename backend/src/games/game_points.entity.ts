import { Entity, Column, ManyToOne } from 'typeorm';
//
import { DefaultEntity } from '../common/entities';
import { Users } from '../users/users.entity';
import { Games } from './games.entity';

@Entity()
export class GamePoints extends DefaultEntity {
  @ManyToOne(() => Users, { eager: true })
  user!: Users;

  @ManyToOne(() => Games, { eager: true })
  game!: Games;

  @Column()
  point!: number;
}

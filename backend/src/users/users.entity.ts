import { IsString } from '@nestjs/class-validator';
import { Exclude } from '@nestjs/class-transformer';

import { Entity, Column } from 'typeorm';
import { DefaultEntity } from '../common/entities';

@Entity()
export class Users extends DefaultEntity {
  @Column({ unique: true })
  @IsString()
  login!: string;

  @Column()
  @Exclude()
  password!: string;
}

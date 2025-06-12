import {
  IsBoolean,
  IsDate,
  IsString,
  ValidateNested,
} from '@nestjs/class-validator';

import { Type } from '@nestjs/class-transformer';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Users } from '../users/users.entity';
import { DefaultEntity } from '../common/entities';

@Entity()
export class AuthTokens extends DefaultEntity {
  @Column()
  @IsString()
  token!: string;

  @Column()
  @IsDate()
  expiredAt!: Date;

  @Column()
  @IsBoolean()
  enabled!: boolean;

  @ManyToOne(() => Users, { eager: true })
  @ValidateNested()
  @Type(() => Users)
  user!: Users;
}

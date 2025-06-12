import { IsDate, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class DefaultEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsString()
  @ApiProperty({ type: 'string' })
  id!: string;

  @CreateDateColumn({ name: 'created_at' })
  @IsDate()
  @ApiProperty({ type: 'string', format: 'date-string' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @IsDate()
  @ApiProperty({ type: 'string', format: 'date-string' })
  updatedAt!: Date;
}

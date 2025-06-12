import { IsDate } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';
//
import { DefaultEntity } from '../common/entities';

@Entity()
export class Games extends DefaultEntity {
  @ApiProperty({ type: 'string' })
  @Column()
  @IsDate()
  startingAt!: Date;

  @ApiProperty({ type: 'string' })
  @Column()
  @IsDate()
  finishingAt!: Date;
}

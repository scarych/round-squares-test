import { ApiProperty } from '@nestjs/swagger';

import { IsString } from '@nestjs/class-validator';

export class GameStatsDto {
  @IsString()
  @ApiProperty({ description: 'ID пользователя', type: 'string' })
  userId!: string;

  @IsString()
  @ApiProperty({ description: 'Логин пользователя', type: 'string' })
  login!: string;

  @IsString()
  @ApiProperty({ description: 'Всего очков', type: 'number' })
  totalPoints!: number;
}

import { ApiProperty } from '@nestjs/swagger';

import { IsString } from '@nestjs/class-validator';

export class GamesSettingsDto {
  @IsString()
  @ApiProperty({ description: 'Название комнаты для подписки', type: 'string' })
  socketRoomName!: string;

  @IsString()
  @ApiProperty({ description: 'Ожидание', type: 'number' })
  cooldown!: number;
}

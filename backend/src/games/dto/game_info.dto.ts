import { ApiProperty } from '@nestjs/swagger';

import { Games } from '../games.entity';
import { GameStatsDto } from './game_stats.dto';

export class GameInfoDto {
  @ApiProperty({ description: 'Информация об игре', type: Games })
  game!: Games;

  @ApiProperty({
    description: 'Статистика',
    type: GameStatsDto,
    nullable: true,
  })
  topStats!: GameStatsDto;

  @ApiProperty({
    description: 'Статистика',
    type: GameStatsDto,
    nullable: true,
  })
  myStats!: GameStatsDto;
}

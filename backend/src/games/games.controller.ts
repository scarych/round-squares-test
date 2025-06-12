import {
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GamesService } from './games.service';
import { BooleanValueResponseDto, HttpExceptionResponse } from '../common/dto';
import { Games } from './games.entity';
import { UserRoleRequest } from '../common/types';
import { GamePointsService } from './game_points.service';
import { GameStatsDto } from './dto/game_stats.dto';
import { GamesSettingsDto } from './dto/game_settings.dto';

import { GameInfoDto } from './dto/game_info.dto';
import { WsService } from '../websockets/ws.service';
import {
  ERROR_GAME_INACTIVE,
  ERROR_GAME_NOT_FOUND,
  SOCKET_GAMES_ROOM,
} from '../common/constants';

@Controller('games')
@ApiBearerAuth()
@UseGuards(TokenAuthGuard, RolesGuard)
@ApiUnauthorizedResponse({ type: HttpExceptionResponse })
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly gamePointsService: GamePointsService,
    private readonly wsService: WsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: Games, isArray: true })
  async gamesList() {
    return this.gamesService.gamesList();
  }

  @Get('settings')
  @ApiOkResponse({ type: GamesSettingsDto })
  settings(): GamesSettingsDto {
    // вернем настройки для игры, чтобы от делать какие-то полезные действия на фронте
    // считать время до начала раунда, подключаться к комнате и так далее
    // по идее можно вернуть также время и часовой пояс на сервере, чтобы синхронизировать таймеры
    // но это вроде лишнее, так как время в UTC хранится
    const response = new GamesSettingsDto();
    response.socketRoomName = SOCKET_GAMES_ROOM;
    response.cooldown = Number(process.env.COOLDOWN_DURATION);
    return response;
  }

  @Get('create')
  @Roles('admin')
  @ApiForbiddenResponse({ type: HttpExceptionResponse })
  @ApiOkResponse({ type: BooleanValueResponseDto })
  createIsAllowed(): BooleanValueResponseDto {
    // проверочное действие, что текущая сессия у админа и он может создавать игры
    const response = new BooleanValueResponseDto();
    response.value = true;
    return response;
  }

  @Post('create')
  @Roles('admin')
  @ApiOkResponse({ type: Games })
  async createGame() {
    //
    const newGame = await this.gamesService.createGame();
    this.wsService.sendToRoom(SOCKET_GAMES_ROOM, newGame.id);
    return newGame;
  }

  @Get(':id')
  @ApiOkResponse({ type: GameInfoDto })
  @ApiNotFoundResponse({ type: HttpExceptionResponse })
  async getGameById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: UserRoleRequest,
  ) {
    // найдем игру
    const game = await this.gamesService.findById(id);
    if (!game) {
      throw new NotFoundException(`Игра ${id} не найдена`);
    }
    // и посчитаем для нее лучшую сводку и сводку текущего игрока
    const { user } = req;
    const result = new GameInfoDto();
    result.game = game;
    const gameStats = await this.gamePointsService.getPoints(game.id);
    // отберем из результатов только те значения, которые максимальны и которые соответствуют текущему пользователю
    gameStats.forEach((value, index) => {
      if (index === 0) {
        result.topStats = value;
      }
      if (value.userId === user.id) {
        result.myStats = value;
      }
    });

    return result;
  }

  @Post(':id')
  @ApiNotFoundResponse({ type: HttpExceptionResponse })
  @ApiConflictResponse({ type: HttpExceptionResponse })
  @ApiOkResponse({ type: GameStatsDto, isArray: false })
  async pointGame(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: UserRoleRequest,
  ) {
    // зафиксируем действие пользователя в игре
    const game = await this.gamesService.findById(id);
    if (!game) {
      throw new NotFoundException(ERROR_GAME_NOT_FOUND);
    }
    // проверим, что игра активна, если ее тайминги совпадают с текущим временем
    const now = new Date();
    if (game.startingAt >= now || game.finishingAt <= now) {
      throw new ConflictException(ERROR_GAME_INACTIVE);
    }
    // добавим очко текущему пользователю и вернем для него результат
    const { user } = req;
    await this.gamePointsService.addPoint(game, user);
    const [userStat] = await this.gamePointsService.getPoints(game.id, user.id);
    return userStat;
  }
}

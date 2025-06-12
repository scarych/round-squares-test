import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

//
import { GamePoints } from './game_points.entity';
import { GameStatsDto } from './dto/game_stats.dto';
import { Games } from './games.entity';
import { Users } from '../users/users.entity';
import { UserWithRoles } from '../common/types';

const { NULL_POINTS_LOGIN } = process.env;

@Injectable()
export class GamePointsService {
  constructor(
    @InjectRepository(GamePoints)
    private gamesPointsRepository: Repository<GamePoints>,

    @Inject(DataSource)
    private dataSouce: DataSource,
  ) {}
  //

  async addPoint(game: Games, user: UserWithRoles): Promise<GamePoints> {
    // если пользователь имеет логин с нулевым начислением очков (условный Никита), то он сохраняет 0
    const point =
      user.login.toLowerCase() === NULL_POINTS_LOGIN?.toLowerCase() ? 0 : 1;
    // создадим и сохраним новое значение с указанным весом
    const newPoint = this.gamesPointsRepository.create({ game, user, point });
    await this.gamesPointsRepository.save(newPoint);
    return newPoint;
  }

  async getPoints(gameId: string, userId?: string): Promise<GameStatsDto[]> {
    // построим запрос исходя из принципа, что все действия сохранены в общую таблицу
    // каждая запись имеет свой вес (1 или 0, если данные вводил пользователь с нулевым весом (Никита))
    // и каждая 11 строка для пользователя увеличивает вес этого значения в 10 раз
    // в конце объединим с пользователями, чтобы получить логин (если потребуется где-то его показать)
    const result: GameStatsDto[] = await this.dataSouce
      .createQueryBuilder()
      .select('stat."userId"', 'userId')
      .addSelect('u."login"', 'login')
      .addSelect('stat."totalPoints"', 'totalPoints')
      .from((qb) => {
        return qb
          .select('gp."userId"', 'userId')
          .addSelect(
            `SUM(CASE WHEN rn % 11 = 0 THEN gp.point * 10 ELSE gp.point END)`,
            'totalPoints',
          )
          .from((qb) => {
            const subQuery = qb
              .select('gp."userId"', 'userId')
              .addSelect('gp."gameId"', 'gameId')
              .addSelect('gp.point', 'point')
              .addSelect(
                `ROW_NUMBER() OVER (PARTITION BY gp."userId", gp."gameId" ORDER BY gp."created_at")`,
                'rn',
              )
              .from(GamePoints, 'gp')
              .where('gp."gameId" = :gameId', { gameId });

            if (userId) {
              subQuery.andWhere('gp."userId" = :userId', { userId });
            }
            return subQuery;
          }, 'gp')
          .groupBy('gp."userId"')
          .addGroupBy('gp."gameId"');
      }, 'stat')
      .leftJoin(Users, 'u', 'u.id=stat."userId"')
      .orderBy('stat."totalPoints"', 'DESC')
      .getRawMany();

    return result;
  }
}

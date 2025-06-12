import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
//
import { Games } from './games.entity';

const { ROUND_DURATION, COOLDOWN_DURATION } = process.env;

if (!Number(ROUND_DURATION)) {
  throw new Error(`process.env.ROUND_DURATION value required`);
}

if (!Number(COOLDOWN_DURATION)) {
  throw new Error(`process.env.COOLDOWN_DURATION value required`);
}

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Games)
    private gamesRepository: Repository<Games>,
  ) {}

  async gamesList(): Promise<Games[]> {
    //
    return this.gamesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Games | null> {
    //
    return this.gamesRepository.findOneBy({ id });
  }

  async createGame(): Promise<Games> {
    // найдём последнюю оканчиваемую игру
    const [lastFinishingGame] = await this.gamesRepository.find({
      order: { finishingAt: 'DESC' },
      take: 1,
    });
    const now = new Date();
    // найдём максимально возможную дату: это или дата окончания следующей игры или текущая дата
    const maxDate = Math.max(
      +new Date(lastFinishingGame?.finishingAt || 0),
      +now,
    );
    // от этого значения установим дату начала следующей игры
    const nextStartingDate = dayjs(maxDate)
      .add(Number(COOLDOWN_DURATION), 'seconds')
      .toDate();

    // дата окончания следующей игры - это дата начала + время раунда
    const nextFinishingDate = dayjs(nextStartingDate)
      .add(Number(ROUND_DURATION), 'seconds')
      .toDate();

    // создадим игру и сохраним её в базе
    const nextGame = this.gamesRepository.create({
      startingAt: nextStartingDate,
      finishingAt: nextFinishingDate,
    });
    await this.gamesRepository.save(nextGame);
    return nextGame;
    //
  }
}

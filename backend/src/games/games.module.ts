import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Games } from './games.entity';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { AuthModule } from '../auth/auth.module';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { PasswordService } from '../common/services';
import { GamePoints } from './game_points.entity';
import { GamePointsService } from './game_points.service';
import { UsersModule } from '../users/users.module';
import { WsModule } from '../websockets/ws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Games, GamePoints]),
    AuthModule,
    UsersModule,
    WsModule,
  ],
  providers: [GamesService, GamePointsService, PasswordService, TokenAuthGuard],
  controllers: [GamesController],
  exports: [GamesService, GamePointsService, TypeOrmModule],
})
export class GamesModule {
  //
}

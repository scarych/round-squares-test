import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';

import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { GamesController } from './games/games.controller';
import { PgTypeOrm } from './app.config';
import { PasswordService, ShutdownService } from './common/services';

import { WsModule } from './websockets/ws.module';

@Module({
  imports: [PgTypeOrm, AuthModule, UsersModule, GamesModule, WsModule],
  controllers: [
    AppController,
    AuthController,
    GamesController,
    UsersController,
  ],
  providers: [AppService, PasswordService, ShutdownService],
})
export class AppModule {}

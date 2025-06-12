import { Module } from '@nestjs/common';
//
import { WsBearerGuard } from './ws-auth.guard';
import { WsGateway } from './ws.gateway';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { AuthModule } from '../auth/auth.module';
import { PasswordService } from '../common/services';
import { UsersModule } from '../users/users.module';
import { WsService } from './ws.service';
import { WsTokenService } from './ws-token.service';

@Module({
  imports: [AuthModule, UsersModule],

  providers: [
    WsGateway,
    WsService,
    WsTokenService,
    WsBearerGuard,
    AuthService,
    UsersService,
    PasswordService,
  ],
  exports: [WsGateway, WsService, AuthService],
})
export class WsModule {}

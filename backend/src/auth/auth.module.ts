import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthTokens } from './auth.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { PasswordService } from '../common/services';
import { TokenAuthGuard } from './token-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AuthTokens]), UsersModule],
  providers: [TokenAuthGuard, AuthService, PasswordService],
  controllers: [AuthController],
  exports: [AuthService, TokenAuthGuard, TypeOrmModule],
})
export class AuthModule {
  //
}

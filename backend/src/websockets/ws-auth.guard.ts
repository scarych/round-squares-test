import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

import {
  ERROR_AUTH_REQUIRED,
  ERROR_TOKEN_INVALID,
  ERROR_TOKEN_NOT_DEFINED,
} from '../common/constants';
import { WsTokenService } from './ws-token.service';

@Injectable()
export class WsBearerGuard implements CanActivate {
  constructor(
    @Inject(WsTokenService)
    private wsTokenService: WsTokenService,

    @Inject(AuthService)
    private authService: AuthService,

    @Inject(UsersService)
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.wsTokenService.extractTokenFromSocket(client);

      if (!token) {
        throw new WsException(ERROR_TOKEN_NOT_DEFINED);
      }

      const validateToken = await this.authService.checkToken(token);
      if (validateToken) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        client.data.user = this.usersService.userWithRole(validateToken.user);
      } else {
        throw new WsException(ERROR_TOKEN_INVALID);
      }

      return true;
    } catch (error) {
      console.error(ERROR_AUTH_REQUIRED, error);
      throw new WsException(ERROR_AUTH_REQUIRED);
    }
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';

import { UserRoleRequest } from '../common/types';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import {
  ERROR_TOKEN_INVALID,
  ERROR_TOKEN_NOT_DEFINED,
} from '../common/constants';

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private authService: AuthService,

    @Inject(UsersService)
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<UserRoleRequest>();

    const authHeader = <string>req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(ERROR_TOKEN_NOT_DEFINED);
    }
    const rawToken = authHeader.split(' ')[1];

    const validToken = await this.authService.checkToken(String(rawToken));

    if (validToken) {
      req.user = this.usersService.userWithRole(validToken.user);
      return true;
    }
    throw new UnauthorizedException(ERROR_TOKEN_INVALID);
  }
}

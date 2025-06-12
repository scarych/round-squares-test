import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRoleRequest } from '../common/types';
import { ERROR_ACCESS_DENIED } from '../common/constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // если роли не указаны — доступ открыт
    }

    const { user } = context.switchToHttp().getRequest<UserRoleRequest>();

    if (!user || !requiredRoles.some((role) => user.roles?.includes(role))) {
      throw new ForbiddenException(ERROR_ACCESS_DENIED);
    }
    return true;
  }
}

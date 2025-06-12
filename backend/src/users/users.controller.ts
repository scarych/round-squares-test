import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
//
import { UserInfoResponseDto } from './dto/user-info.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { UserRoleRequest } from '../common/types';
import { HttpExceptionResponse } from '../common/dto';

@Controller('users')
@ApiBearerAuth()
@UseGuards(TokenAuthGuard)
@ApiUnauthorizedResponse({ type: HttpExceptionResponse })
export class UsersController {
  @Get('info')
  @ApiOkResponse({ type: UserInfoResponseDto })
  info(@Req() req: UserRoleRequest) {
    //
    const { user } = req;
    const result = new UserInfoResponseDto();
    result.login = user.login;
    return result;
  }
}

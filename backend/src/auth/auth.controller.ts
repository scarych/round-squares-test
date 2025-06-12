import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { ApiConflictResponse, ApiOkResponse } from '@nestjs/swagger';
//
import {
  LoginExistsResponseDto,
  AuthTokenResponseDto,
  LoginPasswordDto,
  LoginDto,
} from './dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { HttpExceptionResponse } from '../common/dto';
import { ERROR_LOGIN_EXISTS, ERROR_WRONG_AUTH } from '../common/constants';
//

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('checkLogin')
  @ApiOkResponse({ type: LoginExistsResponseDto })
  async checkLogin(@Body() body: LoginDto) {
    return this.authService.checkLogin(body.login);
  }

  @Post('register')
  @ApiConflictResponse({ type: HttpExceptionResponse })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  async register(@Body() body: LoginPasswordDto) {
    const loginExists = await this.authService.checkLogin(body.login);
    if (loginExists.exists) {
      throw new ConflictException(ERROR_LOGIN_EXISTS);
    } else {
      // подготовим результат
      const result = new AuthTokenResponseDto();
      // создадим нового пользователя
      const user = await this.usersService.createUser(
        body.login,
        body.password,
      );

      // создадим токен
      result.token = await this.authService.createToken(user);

      return result;
    }
  }

  @Post('login')
  @ApiConflictResponse({ type: HttpExceptionResponse })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  async login(@Body() body: LoginPasswordDto) {
    const user = await this.usersService.validateUser(
      body.login,
      body.password,
    );
    if (!user) {
      throw new ConflictException(ERROR_WRONG_AUTH);
    }

    // подготовим результат
    const result = new AuthTokenResponseDto();
    // создадим токен
    result.token = await this.authService.createToken(user);

    return result;
  }
}

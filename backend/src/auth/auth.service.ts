import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import * as dayjs from 'dayjs';

//
import { AuthTokens } from './auth.entity';
import { UsersService } from '../users/users.service';
// import { LoginDto } from './dto/login.dto';
// import { LoginPasswordDto } from './dto/login-password';

import { PasswordService } from '../common/services/passwords.service';
import { LoginExistsResponseDto } from './dto/login-exists-response.dto';
import { Users } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthTokens)
    private tokensRepository: Repository<AuthTokens>,
    private passwordService: PasswordService,
    private readonly usersService: UsersService,
  ) {}

  async checkToken(token: string): Promise<AuthTokens | null> {
    const encryptedToken = this.passwordService.hashString(String(token));

    // найдем токен, у которого совпадает шифрованное значение
    const validToken = await this.tokensRepository.findOne({
      where: {
        expiredAt: MoreThan(new Date()),
        enabled: true,
        token: encryptedToken,
      },
    });

    return validToken;
  }

  async checkLogin(login: string): Promise<LoginExistsResponseDto> {
    const user = await this.usersService.findByLogin(login);
    const result = new LoginExistsResponseDto();
    result.exists = !!user;
    return result;
  }

  async createToken(user: Users): Promise<string> {
    // создадим случайный токен
    const tokenValue = this.passwordService.randomString(128);
    // время жизни - 1 месяц
    const expiredAt = dayjs().add(1, 'month').toDate();
    // отключим старые токены
    await this.tokensRepository.update(
      { user, enabled: true },
      { enabled: false },
    );
    // создадим запись с зашифрованным токеном
    const authToken = this.tokensRepository.create({
      user,
      enabled: true,
      token: this.passwordService.hashString(tokenValue),
      expiredAt,
    });
    // сохраним в базе
    await this.tokensRepository.save(authToken);
    // вернем изначальный токен

    return tokenValue;
  }
}

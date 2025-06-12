import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Users } from './users.entity';

import { PasswordService } from '../common/services/passwords.service';
import { UserWithRoles } from '../common/types';

const { ADMIN_LOGIN } = process.env;

if (!ADMIN_LOGIN) {
  throw new Error(`process.env.ADMIN_LOGIN value required`);
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,

    private passwordService: PasswordService,
  ) {}

  userWithRole(user: Users): UserWithRoles {
    // вернем базовую информацию о пользователе с учетом его прав доступа
    const { id, login } = user;
    const roles =
      login.toLowerCase() === ADMIN_LOGIN?.toLowerCase() ? ['admin'] : [];
    return { id, login, roles };
  }

  async findByLogin(login: string): Promise<Users | null> {
    // при поиске по логину игнорируем его регистр
    return this.usersRepository.findOne({ where: { login: ILike(login) } });
  }

  async validateUser(login: string, password: string): Promise<Users | null> {
    const user = await this.findByLogin(login);
    if (!user) return null;
    const isMatch = this.passwordService.comparePassword(
      password,
      user.password,
    );
    return isMatch ? user : null;
  }

  async createUser(login: string, password: string): Promise<Users> {
    // зашифруем пароль
    const hashedPassword = this.passwordService.hashString(password);
    // создадим учетную запись, логин сохраним в нижнем регистре
    const user = this.usersRepository.create({
      login,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }
}

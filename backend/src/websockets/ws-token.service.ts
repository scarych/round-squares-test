// 8. Пример использования с сервисом
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsTokenService {
  constructor() {}

  extractTokenFromSocket(client: Socket): string | undefined {
    // Проверяем токен в заголовке авторизации
    const authorization = client.handshake.headers.authorization;

    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.substring(7);
    }

    // Проверяем токен в query параметрах
    const token = client.handshake.query.token;
    if (typeof token === 'string') {
      return token;
    }

    // Проверяем токен в auth объекте
    const auth = client.handshake.auth;
    if (auth && auth.token) {
      return String(auth.token);
    }

    return undefined;
  }
}

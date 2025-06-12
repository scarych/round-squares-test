// 8. Пример использования с сервисом
import { Injectable } from '@nestjs/common';
import { WsGateway } from './ws.gateway';

@Injectable()
export class WsService {
  constructor(private readonly appGateway: WsGateway) {}

  sendNotificationToUser(userId: string, message: string): void {
    this.appGateway.sendToUser(userId, 'notification', {
      message,
      timestamp: new Date().toISOString(),
    });
  }

  sendToRoom(room: string, message: string): void {
    this.appGateway.sendToRoom(room, 'notification', {
      message,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastMessage(message: string): void {
    this.appGateway.server.emit('broadcast', {
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

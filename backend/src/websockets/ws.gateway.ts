import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
//
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { UserRoleSocket } from '../common/types';
import {
  ERROR_SOCKET_CONNECTION,
  ERROR_TOKEN_INVALID,
  ERROR_TOKEN_NOT_DEFINED,
  MESSAGE_SOCKET_CONNECTED,
  MESSAGE_SOCKET_GATEWAY_ACTIVE,
} from '../common/constants';
import { WsBearerGuard } from './ws-auth.guard';
import { WsTokenService } from './ws-token.service';

@WebSocketGateway({
  cors: {
    origin: '*', // без ограничений
  },
  namespace: '/ws',
})
export class WsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('WsGateway');

  constructor(
    @Inject(WsTokenService)
    private wsTokenService: WsTokenService,

    @Inject(AuthService)
    private authService: AuthService,

    @Inject(UsersService)
    private userService: UsersService,
  ) {}

  afterInit(server: Server) {
    this.logger.log(MESSAGE_SOCKET_GATEWAY_ACTIVE, server['name']);
  }

  async handleConnection(client: Socket) {
    try {
      // Проверяем авторизацию при подключении
      const token = this.wsTokenService.extractTokenFromSocket(client);

      if (!token) {
        this.logger.warn(ERROR_TOKEN_NOT_DEFINED, client.id);
        client.emit('error', { message: ERROR_TOKEN_NOT_DEFINED });
        client.disconnect();
        return;
      }

      // проверим валидность токена
      const validToken = await this.authService.checkToken(token);

      if (!validToken) {
        this.logger.warn(ERROR_TOKEN_INVALID, client.id);
        client.emit('error', { message: ERROR_TOKEN_INVALID });
        client.disconnect();
        return;
      }
      const userWithRole = this.userService.userWithRole(validToken.user);
      // Сохраняем данные пользователя в socket
      (<UserRoleSocket>client.data).user = userWithRole;

      this.logger.log(
        `Client connected: ${client.id}, User: ${userWithRole.login}`,
      );

      // Присоединяем пользователя к персональной комнате
      await client.join(`user_${userWithRole.id}`);

      // Уведомляем клиента об успешном подключении
      client.emit('connected', {
        message: MESSAGE_SOCKET_CONNECTED,
        userId: userWithRole.id,
      });
    } catch (error) {
      this.logger.error(ERROR_SOCKET_CONNECTION, error);
      client.emit('error', { message: ERROR_SOCKET_CONNECTION });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const data = client.data as UserRoleSocket;
    const userId = data.user?.id;
    this.logger.log(
      `Client disconnected: ${client.id}${userId ? `, User: ${userId}` : ''}`,
    );
  }

  @UseGuards(WsBearerGuard)
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    const { user } = client.data as UserRoleSocket;

    // Отправляем сообщение всем подключенным клиентам
    this.server.emit('message', {
      ...data,
      userId: user.id,
      login: user.login,
      timestamp: new Date().toISOString(),
    });
  }

  @UseGuards(WsBearerGuard)
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { user } = client.data as UserRoleSocket;

    await client.join(data.room);
    client.emit('joined_room', { room: data.room });
    this.logger.log(`User ${user.id} joined room: ${data.room}`);
  }

  @UseGuards(WsBearerGuard)
  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { user } = client.data as UserRoleSocket;
    await client.leave(data.room);
    client.emit('left_room', { room: data.room });
    this.logger.log(`User ${user.id} left room: ${data.room}`);
  }

  // Метод для отправки сообщения конкретному пользователю
  sendToUser(userId: string, event: string, data: any): void {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  // Метод для отправки сообщения в комнату
  sendToRoom(room: string, event: string, data: any): void {
    this.server.to(room).emit(event, data);
  }
}

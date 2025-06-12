import { createAdapter } from '@socket.io/redis-adapter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import Redis, { RedisOptions } from 'ioredis';
import { Server, ServerOptions } from 'socket.io';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const redisOptions: RedisOptions = {
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  password: REDIS_PASSWORD,
  lazyConnect: true,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor!: ReturnType<typeof createAdapter>;
  private server!: Server;
  private pubClient!: Redis;
  private subClient!: Redis;

  private safeClosed?: boolean;

  async connectToRedis(): Promise<void> {
    this.pubClient = new Redis({
      ...redisOptions,
      keyPrefix: `worker_${process.pid}_pub:`,
    });

    this.subClient = new Redis({
      ...redisOptions,
      keyPrefix: `worker_${process.pid}_sub:`,
    });

    await Promise.all([this.pubClient.connect(), this.subClient.connect()]);

    this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    this.server = super.createIOServer(port, {
      ...options,
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // Увеличиваем таймауты для стабильности
      pingTimeout: 60000,
      pingInterval: 25000,
    }) as Server;
    this.server.adapter(this.adapterConstructor);
    return this.server;
  }

  // Метод для корректного закрытия соединений
  async close(): Promise<void> {
    if (this.safeClosed) return;
    try {
      if (this.server) {
        await this.server.close();
      }

      if (this.pubClient) {
        await this.pubClient.quit();
      }
      if (this.subClient) {
        await this.subClient.quit();
      }
      this.safeClosed = true;
      console.log(`Process ${process.pid} redis safe closed`);
    } catch (e) {
      console.error(`${process.pid} redis close error`, e);
    }
  }
}

import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ShutdownService implements OnApplicationShutdown {
  constructor(private dataSource: DataSource) {}

  async onApplicationShutdown(signal: string) {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      console.log(
        `[TypeORM] ${process.pid}: DataSource destroyed on signal ${signal}`,
      );
    }
  }
}

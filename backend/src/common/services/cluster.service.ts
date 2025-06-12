import { Injectable } from '@nestjs/common';

import * as _cluster from 'cluster';
import * as process from 'node:process';

const numCPUs = parseInt(process.argv[2] || '1');

const cluster = _cluster as unknown as _cluster.Cluster; // typings fix

@Injectable()
export class ClusterService {
  static clusterize(callback: () => Promise<void>): void {
    if (cluster.isPrimary) {
      console.log(`MASTER SERVER (${process.pid}) IS RUNNING `);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      // Перезапускаем воркер при падении
      cluster.on('exit', (worker, code, signal) => {
        console.log(
          `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`,
        );
      });

      let gracefulShutdownStarted = false;
      const gracefulShutdown = (signal: string) => () => {
        if (gracefulShutdownStarted) return;
        gracefulShutdownStarted = true;

        console.log(`Master received ${signal}, disconnecting cluster...`);
        cluster.disconnect(() => {
          console.log('All workers disconnected. Exiting master...');
        });
      };
      // Обработка сигналов для корректного завершения
      process.on('SIGTERM', gracefulShutdown('SIGTERM'));
      process.on('SIGINT', gracefulShutdown('SIGINT'));
    } else {
      callback();
    }
  }
}

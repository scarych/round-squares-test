import 'reflect-metadata';
import 'dotenv/config';

//
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

//
import { AppModule } from './app.module';
import { ClusterService } from './common/services/cluster.service';
import { RedisIoAdapter } from './websockets/redis.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Test case')
    .setDescription('OpenAPI for circled-square test case')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  // Настройка Redis адаптера для WebSocket
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  SwaggerModule.setup('swagger.html', app, documentFactory, {
    jsonDocumentUrl: 'docs.json',
  });

  const shutdownProcessAction = async (signal: string) => {
    console.log(
      `Worker ${process.pid}: Received ${signal}, closing services...`,
    );

    try {
      await redisIoAdapter.close();
      await app.close();
      console.log(`Worker ${process.pid}: Shutdown complete.`);
      process.exit(0);
    } catch (err) {
      console.error(`Worker ${process.pid}: Shutdown error`, err);
    }
  };

  let isShuttingDown = false;

  const shutdownProcessHandler = (signal: string) => () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    void shutdownProcessAction(signal);
  };

  process.on('SIGTERM', shutdownProcessHandler('SIGTERM'));
  process.on('SIGINT', shutdownProcessHandler('SIGINT'));
  process.on('disconnect', shutdownProcessHandler('disconnect'));

  await app.listen(process.env.PORT ?? 3500);
}

ClusterService.clusterize(bootstrap);

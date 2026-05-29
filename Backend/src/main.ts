import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new Logger('🚀 Bootstrap');

  logger.log(`\n${'═'.repeat(60)}\n` +
    `🎮 REVEAL QUIZ RACE API\n` +
    `Node Environment: ${process.env.NODE_ENV || 'development'}\n` +
    `Timestamp: ${new Date().toISOString()}\n` +
    `${'═'.repeat(60)}\n`);

  try {
    logger.log('📦 Creating NestJS application...');
    const app = await NestFactory.create(AppModule);
    logger.log('✓ Application created');

    logger.log('⚙️  Configuring middleware...');
    app.use(bodyParser.json({ limit: '20mb' }));
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

    logger.log('🔐 Enabling CORS...');
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') ?? true,
      credentials: true,
    });

    app.use(cookieParser());

    logger.log('✔️  Setting up validation pipes...');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
      }),
    );

    logger.log('✔️  Setting up interceptors...');
    app.useGlobalInterceptors(new TransformInterceptor());

    const port = process.env.PORT ?? 3001;
    logger.log(`\n🌐 Starting server on port ${port}...`);
    await app.listen(port);

    logger.log(`\n${'═'.repeat(60)}\n` +
      `✅ Server is running!\n` +
      `🔗 URL: http://localhost:${port}\n` +
      `📡 Real-time: ws://localhost:${port}\n` +
      `${'═'.repeat(60)}\n`);
  } catch (error) {
    logger.error(`\n❌ Bootstrap Failed!\n` +
      `Error: ${error.message}\n` +
      `Stack: ${error.stack}\n` +
      `${'═'.repeat(60)}\n`, error);
    process.exit(1);
  }
}

bootstrap();


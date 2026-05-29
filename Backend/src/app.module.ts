import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayerModule } from './modules/player/player.module';
import { PlayerAnswerModule } from './modules/player-answer/player-answer.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { RoomModule } from './modules/room/room.module';
import { DatabaseLogger } from './common/logger/database.logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const mongoUri = config.get<string>('mongoUri');
        const dbLogger = new DatabaseLogger();

        dbLogger.logConnectionStart(mongoUri);

        return {
          uri: mongoUri,
          retryAttempts: 5,
          retryDelay: 5000,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 10000,
          w: 'majority',
          retryWrites: true,
          journal: true,
          onConnectionCreate: (connection) => {
            connection.once('connected', () => {
              dbLogger.logConnectionSuccess();
              dbLogger.logConnectionOptions({
                retryWrites: true,
                w: 'majority',
                journal: true,
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
              });
            });

            connection.on('error', (error) => {
              dbLogger.logConnectionError(error);
            });

            connection.on('disconnected', () => {
              dbLogger.logger.warn('❌ MongoDB Disconnected');
            });

            connection.on('reconnected', () => {
              dbLogger.logger.log('🔄 MongoDB Reconnected');
            });
          },
        };
      },
    }),
    QuizModule,
    RoomModule,
    PlayerModule,
    PlayerAnswerModule,
    RealtimeModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseLogger],
})
export class AppModule {}

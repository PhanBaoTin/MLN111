"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const configuration_1 = __importDefault(require("./config/configuration"));
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const player_module_1 = require("./modules/player/player.module");
const player_answer_module_1 = require("./modules/player-answer/player-answer.module");
const quiz_module_1 = require("./modules/quiz/quiz.module");
const realtime_module_1 = require("./modules/realtime/realtime.module");
const room_module_1 = require("./modules/room/room.module");
const database_logger_1 = require("./common/logger/database.logger");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const mongoUri = config.get('mongoUri');
                    const dbLogger = new database_logger_1.DatabaseLogger();
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
            quiz_module_1.QuizModule,
            room_module_1.RoomModule,
            player_module_1.PlayerModule,
            player_answer_module_1.PlayerAnswerModule,
            realtime_module_1.RealtimeModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, database_logger_1.DatabaseLogger],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const bodyParser = __importStar(require("body-parser"));
async function bootstrap() {
    const logger = new common_1.Logger('🚀 Bootstrap');
    logger.log(`\n${'═'.repeat(60)}\n` +
        `🎮 REVEAL QUIZ RACE API\n` +
        `Node Environment: ${process.env.NODE_ENV || 'development'}\n` +
        `Timestamp: ${new Date().toISOString()}\n` +
        `${'═'.repeat(60)}\n`);
    try {
        logger.log('📦 Creating NestJS application...');
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        logger.log('✓ Application created');
        logger.log('⚙️  Configuring middleware...');
        app.use(bodyParser.json({ limit: '20mb' }));
        app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
        logger.log('🔐 Enabling CORS...');
        app.enableCors({
            origin: process.env.CORS_ORIGIN?.split(',') ?? true,
            credentials: true,
        });
        app.use((0, cookie_parser_1.default)());
        logger.log('✔️  Setting up validation pipes...');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidUnknownValues: false,
        }));
        logger.log('✔️  Setting up interceptors...');
        app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
        const port = process.env.PORT ?? 3001;
        logger.log(`\n🌐 Starting server on port ${port}...`);
        await app.listen(port);
        logger.log(`\n${'═'.repeat(60)}\n` +
            `✅ Server is running!\n` +
            `🔗 URL: http://localhost:${port}\n` +
            `📡 Real-time: ws://localhost:${port}\n` +
            `${'═'.repeat(60)}\n`);
    }
    catch (error) {
        logger.error(`\n❌ Bootstrap Failed!\n` +
            `Error: ${error.message}\n` +
            `Stack: ${error.stack}\n` +
            `${'═'.repeat(60)}\n`, error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map
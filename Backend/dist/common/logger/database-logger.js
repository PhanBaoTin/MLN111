"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseLogger = void 0;
const common_1 = require("@nestjs/common");
let DatabaseLogger = class DatabaseLogger {
    logger = new common_1.Logger('🔗 MongoDB Connection');
    logConnectionStart(uri) {
        const maskedUri = this.maskSensitiveInfo(uri);
        this.logger.log(`\n${'='.repeat(60)}\n` +
            `📡 Starting MongoDB Connection\n` +
            `URI: ${maskedUri}\n` +
            `Timestamp: ${new Date().toISOString()}\n` +
            `${'='.repeat(60)}\n`);
    }
    logConnectionSuccess() {
        this.logger.log(`\n${'✅ MongoDB Connected Successfully'.padEnd(60, ' ')}\n` +
            `✓ Connection Established\n` +
            `✓ Database Ready\n` +
            `Timestamp: ${new Date().toISOString()}\n` +
            `${'='.repeat(60)}\n`);
    }
    logConnectionError(error) {
        this.logger.error(`\n${'❌ MongoDB Connection Failed'.padEnd(60, ' ')}\n` +
            `Error: ${error.message || error}\n` +
            `Code: ${error.code || 'N/A'}\n` +
            `Timestamp: ${new Date().toISOString()}\n` +
            `${'='.repeat(60)}\n`);
    }
    logCollectionCreated(collectionName) {
        this.logger.debug(`📦 Collection '${collectionName}' initialized`);
    }
    logDatabaseInfo(dbName, collections) {
        this.logger.log(`\n📊 Database Information:\n` +
            `Database: ${dbName}\n` +
            `Collections: ${collections}\n` +
            `${'='.repeat(60)}\n`);
    }
    logConnectionRetry(attempt, maxAttempts) {
        this.logger.warn(`⚠️  Connection Retry - Attempt ${attempt}/${maxAttempts}`);
    }
    logTimeout() {
        this.logger.warn(`⏱️  Connection Timeout - Check your network or MongoDB URI`);
    }
    logDisconnected() {
        this.logger.warn('❌ MongoDB Disconnected');
    }
    logReconnected() {
        this.logger.log('🔄 MongoDB Reconnected');
    }
    maskSensitiveInfo(uri) {
        if (!uri)
            return 'N/A';
        return uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://***:***@');
    }
    logQueryPerformance(query, duration) {
        if (duration > 1000) {
            this.logger.warn(`⚠️  Slow Query (${duration}ms): ${query}`);
        }
        else {
            this.logger.debug(`✓ Query (${duration}ms): ${query}`);
        }
    }
    logConnectionOptions(options) {
        this.logger.debug(`📋 Connection Options:\n` +
            `${JSON.stringify({
                retryWrites: options.retryWrites,
                w: options.w,
                journal: options.journal,
                serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
                connectTimeoutMS: options.connectTimeoutMS,
            }, null, 2)}`);
    }
};
exports.DatabaseLogger = DatabaseLogger;
exports.DatabaseLogger = DatabaseLogger = __decorate([
    (0, common_1.Injectable)()
], DatabaseLogger);
//# sourceMappingURL=database-logger.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbLogger = void 0;
const common_1 = require("@nestjs/common");
class DbLogger {
    static logger = new common_1.Logger('📊 DB Operations');
    static startTimer(operation) {
        this.logger.debug(`▶️  Starting: ${operation}`);
        return { operation, startTime: Date.now() };
    }
    static endTimer(timer, message) {
        const duration = Date.now() - timer.startTime;
        const status = duration > 1000 ? '⚠️' : '✓';
        this.logger.log(`${status} [${duration}ms] ${timer.operation}${message ? ` - ${message}` : ''}`);
    }
    static logFind(collection, query, resultCount) {
        this.logger.debug(`🔍 Find in '${collection}': ${resultCount} result(s) - ${JSON.stringify(query).substring(0, 100)}`);
    }
    static logInsert(collection, id) {
        this.logger.log(`➕ Inserted into '${collection}': ${id}`);
    }
    static logUpdate(collection, id) {
        this.logger.log(`✏️  Updated in '${collection}': ${id}`);
    }
    static logDelete(collection, id) {
        this.logger.log(`🗑️  Deleted from '${collection}': ${id}`);
    }
    static logError(collection, operation, error) {
        this.logger.error(`❌ Error in '${collection}' (${operation}): ${error.message}`, error.stack);
    }
    static logConnectionStatus(status, details) {
        const icons = {
            connected: '✅',
            disconnected: '⚠️',
            error: '❌',
        };
        this.logger.log(`${icons[status]} MongoDB: ${status.toUpperCase()}${details ? ` - ${details}` : ''}`);
    }
}
exports.DbLogger = DbLogger;
//# sourceMappingURL=db.logger.js.map
import { Logger } from '@nestjs/common';

/**
 * Helper class for database operation logging
 * Usage: const startTime = DbLogger.startTimer('User Create');
 *        // ... do work
 *        DbLogger.endTimer(startTime, 'User created successfully');
 */
export class DbLogger {
  private static logger = new Logger('📊 DB Operations');

  static startTimer(operation: string) {
    this.logger.debug(`▶️  Starting: ${operation}`);
    return { operation, startTime: Date.now() };
  }

  static endTimer(
    timer: { operation: string; startTime: number },
    message?: string,
  ) {
    const duration = Date.now() - timer.startTime;
    const status = duration > 1000 ? '⚠️' : '✓';

    this.logger.log(
      `${status} [${duration}ms] ${timer.operation}${message ? ` - ${message}` : ''}`,
    );
  }

  static logFind(collection: string, query: any, resultCount: number) {
    this.logger.debug(
      `🔍 Find in '${collection}': ${resultCount} result(s) - ${JSON.stringify(query).substring(0, 100)}`,
    );
  }

  static logInsert(collection: string, id: string) {
    this.logger.log(`➕ Inserted into '${collection}': ${id}`);
  }

  static logUpdate(collection: string, id: string) {
    this.logger.log(`✏️  Updated in '${collection}': ${id}`);
  }

  static logDelete(collection: string, id: string) {
    this.logger.log(`🗑️  Deleted from '${collection}': ${id}`);
  }

  static logError(collection: string, operation: string, error: any) {
    this.logger.error(
      `❌ Error in '${collection}' (${operation}): ${error.message}`,
      error.stack,
    );
  }

  static logConnectionStatus(status: 'connected' | 'disconnected' | 'error', details?: string) {
    const icons = {
      connected: '✅',
      disconnected: '⚠️',
      error: '❌',
    };

    this.logger.log(
      `${icons[status]} MongoDB: ${status.toUpperCase()}${details ? ` - ${details}` : ''}`,
    );
  }
}

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DatabaseLogger {
  logger = new Logger('🔗 MongoDB Connection');

  logConnectionStart(uri: string) {
    const maskedUri = this.maskSensitiveInfo(uri);
    this.logger.log(
      `\n${'='.repeat(60)}\n` +
      `📡 Starting MongoDB Connection\n` +
      `URI: ${maskedUri}\n` +
      `Timestamp: ${new Date().toISOString()}\n` +
      `${'='.repeat(60)}\n`,
    );
  }

  logConnectionSuccess() {
    this.logger.log(
      `\n${'✅ MongoDB Connected Successfully'.padEnd(60, ' ')}\n` +
      `✓ Connection Established\n` +
      `✓ Database Ready\n` +
      `Timestamp: ${new Date().toISOString()}\n` +
      `${'='.repeat(60)}\n`,
    );
  }

  logConnectionError(error: any) {
    this.logger.error(
      `\n${'❌ MongoDB Connection Failed'.padEnd(60, ' ')}\n` +
      `Error: ${error.message || error}\n` +
      `Code: ${error.code || 'N/A'}\n` +
      `Timestamp: ${new Date().toISOString()}\n` +
      `${'='.repeat(60)}\n`,
    );
  }

  logCollectionCreated(collectionName: string) {
    this.logger.debug(
      `📦 Collection '${collectionName}' initialized`,
    );
  }

  logDatabaseInfo(dbName: string, collections: number) {
    this.logger.log(
      `\n📊 Database Information:\n` +
      `Database: ${dbName}\n` +
      `Collections: ${collections}\n` +
      `${'='.repeat(60)}\n`,
    );
  }

  logConnectionRetry(attempt: number, maxAttempts: number) {
    this.logger.warn(
      `⚠️  Connection Retry - Attempt ${attempt}/${maxAttempts}`,
    );
  }

  logTimeout() {
    this.logger.warn(
      `⏱️  Connection Timeout - Check your network or MongoDB URI`,
    );
  }

  logDisconnected() {
    this.logger.warn('❌ MongoDB Disconnected');
  }

  logReconnected() {
    this.logger.log('🔄 MongoDB Reconnected');
  }

  private maskSensitiveInfo(uri: string): string {
    if (!uri) return 'N/A';
    return uri.replace(
      /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
      'mongodb+srv://***:***@',
    );
  }

  logQueryPerformance(query: string, duration: number) {
    if (duration > 1000) {
      this.logger.warn(
        `⚠️  Slow Query (${duration}ms): ${query}`,
      );
    } else {
      this.logger.debug(
        `✓ Query (${duration}ms): ${query}`,
      );
    }
  }

  logConnectionOptions(options: any) {
    this.logger.debug(
      `📋 Connection Options:\n` +
      `${JSON.stringify(
        {
          retryWrites: options.retryWrites,
          w: options.w,
          journal: options.journal,
          serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
          connectTimeoutMS: options.connectTimeoutMS,
        },
        null,
        2,
      )}`,
    );
  }
}
